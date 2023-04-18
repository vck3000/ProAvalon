import React, { useState } from 'react';
import { hot } from 'react-hot-loader/root';
import Modal from 'react-modal';

declare const currentOnlinePlayers: { displayUsername: string };

Modal.setAppElement('#matchMakingTimer');

function MatchMakingModal() {
  // This is boolean to know whether the user click the matchmaking button
  const [modalIsClick, setModalIsClick] = useState(false);

  function clickModal() {
    setModalIsClick(true);
    console.log("hi");
  }

  function closeModal() {
    setModalIsClick(false);
  }

  return (
    <div>
      <button onClick={clickModal} className="matchmaking-btn btn btn-default">
        Rank Game
      </button>

      <Modal isOpen={modalIsClick} onRequestClose={closeModal}>
        <p>Finding Match:</p>

      </Modal>
    </div>
  );
}

export default hot(MatchMakingModal);