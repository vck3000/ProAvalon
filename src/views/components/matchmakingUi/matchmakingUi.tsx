import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io';

let socket: Socket = undefined;

export function MatchmakingUi() {
  const [joined, setJoined] = useState(false);
  const [numPlayersInQueue, setNumPlayersInQueue] = useState(0);

  useEffect(() => {
    // @ts-ignore
    socket = socket_;

    socket.on('queueReply', (data: { joined: boolean }) => {
      setJoined(data.joined);
    });

    socket.on('numPlayersInQueue', (data) => {
      setNumPlayersInQueue(data.numPlayersInQueue);
    });
  }, []);

  const joinQueue = () => {
    socket.emit('queue-request', { join: !joined });
  };

  return (
    <div>
      <a
        id="queueButton"
        className="btn btn-default"
        href="#"
        onClick={joinQueue}
      >
        {joined ? 'Leave Queue' : 'Join Queue'}
      </a>
      <p>
        <span id="numPlayersInQueue">{numPlayersInQueue}</span> player(s) in
        queue
      </p>
    </div>
  );
}
