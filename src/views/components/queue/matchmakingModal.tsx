import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import Modal from 'react-modal';
import { Socket } from 'socket.io';
import ModalContent from './components/modalContent';
import buttonProps from './styles/buttonProps';
import Loading from './components/loading';
import { btnContainer, modalStyles } from './styles/styles';

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
    });
    socket_.on('leave-queue', function () {
      setShowElement(false);
      setClickedButton(null);
      setButtonsDisabled(false);
    });
    socket_.on('declined-to-play', function (data) {
      setModalOpen(false);
      alert('Someone has left the queue');
      if (data.decliningPlayer !== data.username) {
        setShowElement(true);
      } else {
        setClickedButton(null);
      }
    });
    
    socket_.on('game-has-begun', function () {
      setModalOpen(false);
      setClickedButton(null);
    });
  }, []);

  useEffect(() => {
    if (clickedButton === 'unrankBtn') {
      socket_.emit('join-unranked-queue', {
        numPlayers: 6,
      });
    } else if (clickedButton === 'rankBtn') {
      socket_.emit('join-ranked-queue', {
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
    if (clickedButton === 'unrankBtn') {
      socket_.emit('leave-unranked-queue');
    } else if (clickedButton === 'rankBtn') {
      socket_.emit('leave-ranked-queue');
    }
    setShowElement(false);
    setClickedButton(null);
  };

  const joinGame = () => {
    if (clickedButton === 'unrankBtn') {
      socket_.emit('ready-unranked-game', { playerReady: true });
    } else if (clickedButton === 'rankBtn') {
      socket_.emit('ready-ranked-game', { playerReady: true });
    }
    setConfirmJoinGame(true);
  };

  const cancelQueue = () => {
    console.log(clickedButton);
    if (clickedButton === 'unrankBtn') {
      socket_.emit('ready-unranked-game', { playerReady: false });
    } else if (clickedButton === 'rankBtn') {
      socket_.emit('ready-ranked-game', { playerReady: false });
    }
  };

  return (
    <div className="matchmaking-container">
      <div style={btnContainer}>
        <button
          {...buttonProps({
            button: 'rankBtn',
            clickedButton,
            buttonsDisabled,
            handleClick,
          })}
          id='rankdButton'
          className="btn btn-default"
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
          className="btn btn-default"
        >
          Unranked Game
        </button>
      </div>

      {showElement && <Loading leaveQueue={leaveQueue} />}

      <Modal
        isOpen={modalOpen}
        onRequestClose={cancelQueue}
        contentLabel="Modal"
        style={modalStyles}
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
