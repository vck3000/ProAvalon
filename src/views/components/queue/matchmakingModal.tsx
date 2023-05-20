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
  const [second, setSecond] = useState(60);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Obtaining a nice clean, typed reference to the global socket object.
  // @ts-ignore
  const socket_: Socket = socket;
  // let intervalId: any;

  // Variables for timer
  const minutes = Math.floor(count / 60);
  const seconds = count % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // To create a countup timer
  useEffect(() => {
    socket_.on('confirm-ready-to-play', function () {
      setModalOpen(true);
      setShowElement(false);
      setClickedButton(null);
      setCount(0);
    });
    socket_.on('leave-queue', function () {
      setShowElement(false);
      setClickedButton(null);
      setButtonsDisabled(false);
    });
    socket_.on('declined-to-play', function (data) {
      setModalOpen(false);
      alert(data.decliningPlayer + ' has leave the queue');
      console.log(this.request);
    });
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (second > 0) {
        setSecond(second - 1);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [second])

  // Handlers
  const handleClick = (button: ButtonId) => {
    setCount(0);
    setSecond(60);
    const newIntervalId = setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);
    setIntervalId(newIntervalId);
    console.log(newIntervalId);
    const playerObj = {
      numPlayers: 6,
    };

    setClickedButton(button);
    setShowElement(true);

    if (button === 'unrankBtn') {
      socket_.emit('join-unranked-queue', playerObj);
    }

    return () => clearInterval(intervalId);
  };

  const leaveQueue = () => {
    socket_.emit('leave-unranked-queue');
    console.log(intervalId);
    if (intervalId) {
      clearInterval(intervalId);
    }
    setIntervalId(null);
    setCount(0);
  };


  const cancelQueue = () => {
    socket_.emit('initiate-unranked-game', { playerReady: false });
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

      <button {...buttonProps('unrankBtn')} className="matchmaking-btn btn btn-default">
        Unranked Game
      </button>

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
          <h2>{second}</h2>
          <button>Join</button>
          <button onClick={cancelQueue}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

export default hot(MatchMakingModal);
