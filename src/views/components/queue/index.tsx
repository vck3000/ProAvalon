import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import Modal from 'react-modal';
import { subscribe, Queue } from '../../../match/queue';

declare const currentOnlinePlayers: { displayUsername: string };

Modal.setAppElement('#matchMakingTimer');
type ButtonId = 'rankBtn' | 'unrankBtn';

function MatchLoading() {
  const queue = new Queue();
  const playerID = currentOnlinePlayers.displayUsername;

  // All useStates
  const [clickedButton, setClickedButton] = useState<ButtonId | null>(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [showElement, setShowElement] = useState(false);
  const [count, setCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

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
    setClickedButton(button);
    setShowElement(true);
    setModalOpen(true);
    queue.join(playerID);
  };

  const cancelQueue = () => {
    setShowElement(false);
    setCount(0);
    setClickedButton(null);
    setButtonsDisabled(false);
    setModalOpen(false);
    queue.leave(playerID);
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

  queue.subscribe({
    onJoin: (playerID: string) => {
      console.log(`Player ${playerID} joined the queue`);
    },
    onLeave: (playerID: string) => {
      console.log(`Player ${playerID} left the queue`);
    },
  });

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
        <button onClick={cancelQueue}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="matchmaking-container">
      <button {...buttonProps('rankBtn')} className="matchmaking-btn">
        Rank Game
      </button>

      <button {...buttonProps('unrankBtn')} className="matchmaking-btn">
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
          <button>Join</button>
          <button onClick={cancelQueue}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

export default hot(MatchLoading);
