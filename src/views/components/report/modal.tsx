import React, { useState } from 'react';
// import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

declare const currentOnlinePlayers: string[];

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#reportDiv');

export function TestModal() {
  const [player, setPlayer] = useState('');
  const [reason, setReason] = useState('');
  const [desc, setDesc] = useState('');

  const subtitleRef = React.useRef<HTMLHeadingElement>(null);
  const suggestionPlayers: { name: string }[] = [];
  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
    currentOnlinePlayers.map((user: string) => {
      var jsonUser = JSON.parse(JSON.stringify(user));
      suggestionPlayers.push({ name: jsonUser.displayUsername.split(' ')[0] });
    });
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // @ts-ignore
    subtitleRef.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = {
      player,
      reason,
      desc,
    };
    const response = await fetch('/mod/form', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });

    console.log(response);
    response.status;
    if (response.status === 200) {
      Swal.fire({ title: 'Success', type: 'success' });
    } else if (response.status === 400) {
      Swal.fire({ title: 'Error', type: 'error' });
    }
  }

  function escapeRegexCharacters(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function getSuggestions(value: string) {
    const escapedValue = escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
      return [];
    }

    const regex = new RegExp('^' + escapedValue, 'i');

    return suggestionPlayers.filter((player) => regex.test(player.name));
  }

  function getSuggestionValue(suggestion: { name: string }) {
    return suggestion.name;
  }

  function renderSuggestion(suggestion: { name: string }) {
    return <span>{suggestion.name}</span>;
  }

  return (
    <div>
      <button
        onClick={openModal}
        // style={
        // {
        // backgroundColor: '#f44336',
        // color: 'white',
        // border: '0px',
        // padding: '7px',
        // paddingRight: '15px',
        // paddingLeft: '15px',
        // borderRadius: '8px',
        // }
        // }
      >
        Report
      </button>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2 ref={subtitleRef}>Report</h2>
        <br />
        <form onSubmit={submitForm}>
          <label>Select A Player: </label>
          <br />
          <select name="player" onChange={(e) => setPlayer(e.target.value)}>
            <option value="">--Please Choose A Player--</option>
            {/* need to load players from database*/}
            <option value="asdf">asdf</option>
          </select>
          <br />
          <br />
          <label>Select A Reason: </label>
          <br />
          <select name="reason" onChange={(e) => setReason(e.target.value)}>
            <option value="">--Please Choose A Reason--</option>
            <option value="harrassment">Harrassment</option>
            <option value="ipsum">ipsum</option>
            <option value="doler">doler</option>
            <option value="other">Other</option>
          </select>
          <br />
          <br />
          <label>Any Additional Information: </label>
          <br />
          <textarea
            rows={4}
            cols={50}
            name="addInfo"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
          <br />
          {/* Onclick feature to store it into database*/}
          <button
            style={{
              backgroundColor: 'green',
              color: 'white',
              border: '0px',
              borderRadius: '8px',
              padding: '4px',
              paddingRight: '10px',
              paddingLeft: '10px',
            }}
          >
            Report
          </button>
        </form>
        <button
          style={{
            backgroundColor: 'red',
            color: 'white',
            border: '0px',
            borderRadius: '8px',
            padding: '4px',
            paddingRight: '10px',
            paddingLeft: '10px',
          }}
          onClick={closeModal}
        >
          Close
        </button>
      </Modal>
    </div>
  );
}
