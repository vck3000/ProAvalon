import React, { useEffect, useState } from 'react';
import {
  inQueueContainer,
  matchMakingHeading,
  timer,
  loadingIcon,
  loadingContainer,
  btnRed,
} from '../styles/styles';

interface LoadingProps {
  leaveQueue: () => void;
}

const useQueueInterval = (initialCount: number, interval: number) => {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [interval]);

  const reset = () => {
    setCount(initialCount);
  };

  return { count, reset };
};

const Loading: React.FC<LoadingProps> = ({ leaveQueue }) => {
  const { count } = useQueueInterval(0, 1000);

  const formattedTime = `${Math.floor(count / 60)
    .toString()
    .padStart(2, '0')}:${(count % 60).toString().padStart(2, '0')}`;

  return (
    <div style={inQueueContainer}>
      <p style={matchMakingHeading}>You are in Queue</p>
      <div style={loadingContainer}>
        <div style={loadingIcon}></div>
        <div style={timer}>{formattedTime}</div>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>
      <button style={btnRed} onClick={leaveQueue}>
        Leave Queue
      </button>
    </div>
  );
};

export default Loading;
