import React, { useEffect, useState } from 'react';

// @ts-ignore
const socket: Socket = socket_;

export function MatchmakingButton() {
  const [joined, setJoined] = useState(false);
  const [queueButtonText, setQueueButtonText] = useState('Join Queue');

  useEffect(() => {
    socket.on('queueReply', (data: any) => {
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
