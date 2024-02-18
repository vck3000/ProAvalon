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

  const [suggestionPlayers, setSuggestionPlayers] = useState<string[]>([]);

  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  function openModal() {
    setModalIsOpen(true);

    const suggestions: string[] = [];
    currentOnlinePlayers.map((user) => {
      suggestions.push(user.displayUsername.split(' ')[0]);
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
      Swal.fire({ text: await response.text(), icon: 'success' });
    } else {
      Swal.fire({ text: await response.text(), icon: 'error' });
    }
  }

  return (
    <div style={{ zIndex: 20 }}>
      <button
        onClick={openModal}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          border: '0px',
          // padding: '7px',
          // paddingRight: '15px',
          // paddingLeft: '15px',
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
        <h5>
          <b>This report form is only for data collection purposes.</b>
          <br />
          Please make a ticket through the official discord server to make a
          report.
        </h5>
        <form onSubmit={submitForm}>
          <label>Select A Player: </label>
          <br />

          <AutoSuggestWrapper
            allSuggestions={suggestionPlayers}
            setValue={setPlayer}
          />

          <br />
          <label>Select A Reason: </label>
          <br />
          <select name="reason" onChange={(e) => setReason(e.target.value)}>
            <option value="N/A">--Please Choose A Reason--</option>
            <option value="Abusive">Abusive</option>
            <option value="Intentional throwing/griefing">
              Intentional throwing/griefing
            </option>
            <option value="Inactivity (AFK)">Inactivity (AFK)</option>
            <option value="Spam">Spam</option>
            <option value="Cheating (multiaccounting or talking outside of game)">
              Cheating (multiaccounting or talking outside of game)
            </option>
            <option value="Other">Other</option>
          </select>
          <br />
          <br />
          <label>Description: </label>
          <br />
          <p> The more information you provide, the more likely</p>
          <p>your report will be resolved.</p>
          <br />
          <p>Empty reports will be ignored.</p>
          <br />
          <textarea
            rows={4}
            cols={50}
            name="addInfo"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
          <br />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              style={{
                ...buttonBaseStyles,
                backgroundColor: 'red',
                marginRight: '20px',
              }}
              onClick={closeModal}
            >
              Close
            </button>

            <button
              type="submit"
              style={{
                ...buttonBaseStyles,
                backgroundColor: 'green',
              }}
            >
              Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
