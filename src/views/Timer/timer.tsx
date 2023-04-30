import React, { useState, useEffect } from 'react';

interface Props {
  initialValue: number;
}

const Timer: React.FC<Props> = ({ initialValue }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialValue);

  useEffect(() => {
    localStorage.setItem('timerValue', JSON.stringify(secondsRemaining));
    const intervalId = setInterval(() => {
      setSecondsRemaining((seconds) => seconds - 1);
    }, 1000);

    if (secondsRemaining <= 0) {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [secondsRemaining]);

  return (
    <div>
      <p>{secondsRemaining} seconds remaining</p>
    </div>
  );
};

export default Timer;