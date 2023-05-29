import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import Modal from 'react-modal';
import { Socket } from 'socket.io';
import ModalContent from './components/modalContent';
import buttonProps from './components/buttonProps';
import Loading from './components/loading';

Modal.setAppElement('#matchMakingTimer');
type ButtonId = 'rankBtn' | 'unrankBtn';

export function MatchMakingModal() {
  // All useStates
  const [clickedButton, setClickedButton] = useState<ButtonId | null>(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [showElement, setShowElement] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmJoinGame, setConfirmJoinGame] = useState(false);

  // @ts-ignore
  const socket_: Socket = socket;

  // UseEffects for Sockets (getting functions and data)
  useEffect(() => {
    socket_.on('confirm-ready-to-play', function () {
      setModalOpen(true);
      setShowElement(false);
      setClickedButton(null);
    });
    socket_.on('leave-queue', function () {
      setShowElement(false);
      setClickedButton(null);
      setButtonsDisabled(false);
    });
    socket_.on('declined-to-play', function (data) {
      setModalOpen(false);
      if (data.decliningPlayer !== data.username) {
        document.getElementById('unrankButton').click();
      }
      alert(data.decliningPlayer + ' has left the queue');
    });
    socket_.on('game-has-begun', function () {
      setModalOpen(false);
    });
  }, []);


  useEffect(() => {
    if (clickedButton === 'unrankBtn') {
      socket_.emit('join-unranked-queue', {
        numPlayers: 6,
      });
    }
  }, [clickedButton, socket_]);

  const handleClick = (button: ButtonId) => {
    setConfirmJoinGame(false);
    setClickedButton(button);
    setShowElement(true);
  };

  const leaveQueue = () => {
    socket_.emit('leave-unranked-queue');
    setShowElement(false);
    setClickedButton(null);
  };

  const joinGame = () => {
    socket_.emit('initiate-unranked-game', { playerReady: true });
    setConfirmJoinGame(true);
  };

  const cancelQueue = () => {
    socket_.emit('initiate-unranked-game', { playerReady: false });
  };

  return (
    <div className="matchmaking-container">
      <button
        {...buttonProps({
          button: 'rankBtn',
          clickedButton,
          buttonsDisabled,
          handleClick,
        })}
        className="matchmaking-btn btn btn-default"
      >
        Rank Game
      </button>

      <button
        {...buttonProps({
          button: 'unrankBtn',
          clickedButton,
          buttonsDisabled,
          handleClick,
        })}
        id="unrankButton"
        className="matchmaking-btn btn btn-default"
      >
        Unranked Game
      </button>

      {showElement && <Loading leaveQueue={leaveQueue} />}

      <Modal
        isOpen={modalOpen}
        onRequestClose={cancelQueue}
        contentLabel="Modal"
      >
        <ModalContent
          confirmJoinGame={confirmJoinGame}
          joinGame={joinGame}
          cancelQueue={cancelQueue}
          socket_={socket_}
        />
      </Modal>
    </div>
  );
}

export default hot(MatchMakingModal);
