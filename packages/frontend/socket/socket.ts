import io from 'socket.io-client';

import { getApiUrl, getEnv } from '../config';

const socket = io(getApiUrl(), {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Don't connect if we are the server! There should be a better way to do this.
if (getEnv() === 'server') {
  socket.close();
}

export default socket;

export const socketEmitProto = (
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messageType: any,
  contents: object,
): void => {
  if (
    messageType &&
    messageType.create &&
    messageType.encode &&
    messageType.verify
  ) {
    if (messageType.verify(contents) !== null) {
      throw messageType.verify(contents);
    }
    const msg = messageType.create(contents);
    socket.emit(event, Buffer.from(messageType.encode(msg).finish()));
  } else {
    throw TypeError('Bad message type given.');
  }
};
