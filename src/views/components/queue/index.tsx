import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import Modal from 'react-modal';
import { subscribe, Queue } from '../../../match/queue';

declare const currentOnlinePlayers: { displayUsername: string };

Modal.setAppElement('#matchMakingTimer');
type ButtonId = 'rankBtn' | 'unrankBtn';

function MatchLoading() {
  // All useStates
  const [clickedButton, setClickedButton] = useState<ButtonId | null>(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [showElement, setShowElement] = useState(false);
  const [count, setCount] = useState(0);

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
  };

  const cancelQueue = () => {
    setShowElement(false);
    setCount(0);
    setClickedButton(null);
    setButtonsDisabled(false);
  }

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
  }

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
  }

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
    <div>
      <button
        {...buttonProps('rankBtn')}
        className="matchmaking-btn btn btn-default"
      >
        Rank Game
      </button>

      <button
        {...buttonProps('unrankBtn')}
        className="matchmaking-btn btn btn-default"
      >
        Unranked Game
      </button>

      {showElement && <Loading />}
    </div>
  );
}

export default hot(MatchLoading);
