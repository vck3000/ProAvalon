import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io';

let socket: Socket = undefined;

export function MatchmakingButton() {
  const [joined, setJoined] = useState(false);
  const [queueButtonText, setQueueButtonText] = useState('Join Queue');

  useEffect(() => {
    // @ts-ignore
    socket = socket_;

    socket.on('queueReply', (data: { joined: boolean }) => {
      setJoined(data.joined);
      setQueueButtonText(data.joined ? 'Leave Queue' : 'Join Queue');
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
        {queueButtonText}
      </a>
    </div>
  );
}
