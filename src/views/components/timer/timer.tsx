import React, {useEffect, useState} from 'react';
import { hot } from 'react-hot-loader/root';
import { Socket } from 'socket.io';
import Modal from 'react-modal';

Modal.setAppElement('#Timer');
export function TimerModal() {
    // @ts-ignore
    const socket_: Socket = socket;
    const [timeRainming, setTimeRemaining] = useState(0);

    useEffect(() => {
        socket_.on('RoomTimer',(newvalue = Number) => {
            setTimeRemaining(newvalue);
        });

        return () => clearInterval(timeRainming);
    }, []);

    const minutes = Math.floor(timeRainming/60);
    const seconds = timeRainming % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div>{formattedTime}</div>
    );
}

export default hot(TimerModal);