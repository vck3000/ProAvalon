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
