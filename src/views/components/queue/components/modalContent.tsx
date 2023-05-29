import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io';

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

  useEffect(() => {
    let newIntervalId: any;

    if (startCountdown && second > 0) {
      newIntervalId = setInterval(() => {
        setSecond((prevSecond) => prevSecond - 1);
      }, 1000);
    } else if (second === 0) {
      // Logic for initiating unranked game
      socket_.emit('initiate-unranked-game', { playerReady: false });
      setStartCountdown(false);
    }

    return () => {
      clearInterval(newIntervalId);
    };
  }, [startCountdown, second]);

  return (
    <div>

      <h1>Match Found!</h1>
      <p>{confirmJoinGame ? 'Waiting for other players!' : second}</p>
      <button onClick={joinGame}>Join</button>
      <button onClick={cancelQueue}>Cancel</button>
    </div>
  );
};

export default ModalContent;
