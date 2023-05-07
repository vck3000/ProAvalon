import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import Modal from 'react-modal';
import { Socket } from 'socket.io';

Modal.setAppElement('#matchMakingTimer');
type ButtonId = 'rankBtn' | 'unrankBtn';

// Connect with match.tsx

export function MatchMakingModal() {
  // All useStates
  const [clickedButton, setClickedButton] = useState<ButtonId | null>(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [showElement, setShowElement] = useState(false);
  const [count, setCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [counterFromServer, setCounterFromServer] = useState(0);

  // Obtaining a nice clean, typed reference to the global socket object.
  // @ts-ignore
  const socket_: Socket = socket;

  // Variables for timer
  const minutes = Math.floor(count / 60);
  const seconds = count % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // To create a countup timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleClick = (button: ButtonId) => {
    const playerObj = {
      numPlayers: 6,
    };

    setClickedButton(button);
    setShowElement(true);

    if (button === 'unrankBtn') {
      socket_.emit('join-unranked-queue', playerObj);
      socket_.on('confirm-ready-to-play', function () {
        setModalOpen(true);
        setShowElement(false);
        setClickedButton(null);
        setCount(0);
      });
    }
  };

  const leaveQueue = () => {
    socket_.emit('leave-unranked-queue');
    socket_.on('leave-queue', function () {
      setShowElement(false);
      setCount(0);
      setClickedButton(null);
      setButtonsDisabled(false);
    });
  };

  const cancelQueue = () => {
    socket_.emit('initiate-unranked-game', {playerReady: false});
    socket_.on('declined-to-play', function (data) {
      console.log(data);
      setModalOpen(false);
      alert(data.decliningPlayer);
      console.log(this.request);
    })
  };

  const btnStyle = (button: ButtonId) => {
    const baseStyle: React.CSSProperties = { backgroundColor: 'transparent' };
    if (clickedButton === button) {
      baseStyle.backgroundColor = 'yellow';
    }
    if (buttonsDisabled) {
      baseStyle.backgroundColor = 'transparent';
      baseStyle.cursor = 'not-allowed';
    }
    return baseStyle;
  };

  const buttonProps = (button: ButtonId) => {
    const props: React.ButtonHTMLAttributes<HTMLButtonElement> = {
      style: btnStyle(button),
      onClick: () => handleClick(button),
    };
    if (clickedButton && clickedButton !== button) {
      props.disabled = true;
    }
    if (buttonsDisabled) {
      props.disabled = true;
    }
    return props;
  };

  function Loading() {
    return (
      <div>
        <p>You are in Queue:</p>
        <h1>{formattedTime}</h1>
        <button onClick={leaveQueue}>Leave Queue</button>
      </div>
    );
  }

  return (
    <div className="matchmaking-container">
      <button
        {...buttonProps('rankBtn')}
        className="matchmaking-btn btn btn-default"
      >
        Rank Game
      </button>

      <button {...buttonProps('unrankBtn')} className="matchmaking-btn">
        Unranked Game
      </button>

      <p>{counterFromServer}</p>

      {showElement && <Loading />}

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Modal"
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          content: {
            width: '400px',
            height: '200px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <div>
          <h1>Match Found!</h1>
          <button>Join</button>
          <button onClick={cancelQueue}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

export default hot(MatchMakingModal);
