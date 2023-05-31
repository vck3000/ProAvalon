import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io';
import {
  timerContainer,
  timerBar,
  matchMakingHeading,
  btnGreen,
  btnRed,
  centerElement,
  modalElement,
} from '../styles/styles';

interface ModalContentProps {
  confirmJoinGame: boolean;
  joinGame: () => void;
  cancelQueue: () => void;
  socket_: Socket;
}

const ModalContent: React.FC<ModalContentProps> = ({
  confirmJoinGame,
  joinGame,
  cancelQueue,
  socket_,
}) => {
  const [startCountdown, setStartCountdown] = useState(true);
  const [second, setSecond] = useState(60);
  const maxSecond = 60;

  useEffect(() => {
    let newIntervalId: any;

    if (startCountdown && second > 0) {
      newIntervalId = setInterval(() => {
        setSecond((prevSecond) => prevSecond - 1);
      }, 1000);
    } else if (second === 0) {
      // Logic for initiating unranked game
      socket_.emit('ready-unranked-game', { playerReady: false });
      setStartCountdown(false);
    }

    return () => {
      clearInterval(newIntervalId);
    };
  }, [startCountdown, second, socket_]);

  // Calculate the progress percentage
  const progress = second / maxSecond * 100;

  // Determine the background color based on remaining time
  let backgroundColor = '#87ceeb'; // Default color

  if (second <= 30) {
    backgroundColor = '#ffd700'; // Yellow color
  }

  if (second <= 10) {
    backgroundColor = '#ff0000'; // Red color
  }

  return (
    <div style={modalElement}>
      <h1 style={centerElement}>Match Found!</h1>
      {confirmJoinGame ? (
        <p style={matchMakingHeading}>Waiting for other players!</p>
      ) : (
        <div style={timerContainer}>
          <div
            style={{ ...timerBar, width: `${progress}%`, backgroundColor }}
          ></div>
        </div>
      )}
      <div style={centerElement}>
        <button style={btnGreen} onClick={joinGame}>
          Join
        </button>
        <button style={btnRed} onClick={cancelQueue}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ModalContent;
