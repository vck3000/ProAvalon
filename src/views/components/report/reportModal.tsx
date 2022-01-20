import React, { useState } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { AutoSuggestWrapper } from '../common/autoSuggestWrapper';

declare const currentOnlinePlayers: { displayUsername: string }[];

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const buttonBaseStyles = {
  color: 'white',
  border: '0px',
  borderRadius: '8px',
  padding: '4px',
  paddingRight: '10px',
  paddingLeft: '10px',
};

Modal.setAppElement('#reportDiv');

export function ReportModal() {
  const [player, setPlayer] = useState('');
  const [reason, setReason] = useState('');
  const [desc, setDesc] = useState('');

  const [suggestionPlayers, setSuggestionPlayers] = useState<
    { name: string }[]
  >([]);

  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  function openModal() {
    setModalIsOpen(true);

    const suggestions: { name: string }[] = [];
    currentOnlinePlayers.map((user) => {
      suggestions.push({ name: user.displayUsername.split(' ')[0] });
    });

    setSuggestionPlayers(suggestions);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = {
      player,
      reason,
      desc,
    };

    const response = await fetch('/mod/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(response);

    if (response.status === 200) {
      Swal.fire({ title: await response.text(), type: 'success' });
    } else {
      Swal.fire({ title: await response.text(), type: 'error' });
    }
  }

  return (
    <div style={{zIndex: 20}}>
      <button
        onClick={openModal}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          border: '0px',
          padding: '7px',
          paddingRight: '15px',
          paddingLeft: '15px',
          borderRadius: '8px',
        }}
      >
        Report
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Report Modal"
      >
        <h2>Report</h2>
        <br />
        <form onSubmit={submitForm}>
          <label>Select A Player: </label>
          <br />

          <AutoSuggestWrapper
            allSuggestions={suggestionPlayers}
            setValue={setPlayer}
          />

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
          <button
            style={{
              ...buttonBaseStyles,
              backgroundColor: 'green',
            }}
          >
            Report
          </button>
        </form>
        <button
          style={{
            ...buttonBaseStyles,
            backgroundColor: 'red',
          }}
          onClick={closeModal}
        >
          Close
        </button>
      </Modal>
    </div>
  );
}
