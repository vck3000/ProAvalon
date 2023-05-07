import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { Socket } from 'socket.io';

export function Timer() {
    // Obtaining a nice clean, typed reference to the global socket object.
    // @ts-ignore
    const socket_: Socket = socket;
    const [timeRemaining, setTimeRemaining] = useState(0);
  
    useEffect(() => {
      // listen for timerUpdate event and update timeRemaining state
      socket_.on('timerUpdate', (time = Number) => {
        setTimeRemaining(time);
      });
  
      return () => clearInterval(timeRemaining)
    }, []);
  
    // format timeRemaining to display as minutes and seconds
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
    return (
      <div>
        <h2>Timer: {formattedTime}</h2>
      </div>
    );
};
  
export default hot(Timer);