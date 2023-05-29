import React, { useEffect, useState } from 'react';

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
  const { count, reset } = useQueueInterval(0, 1000);

  const formattedTime = `${Math.floor(count / 60)
    .toString()
    .padStart(2, '0')}:${(count % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    if (count === 60) {
      leaveQueue();
      reset();
    }
  }, [count, leaveQueue, reset]);

  return (
    <div>
      <p>Queue Time: {formattedTime}</p>
      <button onClick={leaveQueue}>Leave Queue</button>
    </div>
  );
};

export default Loading;
