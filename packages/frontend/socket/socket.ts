import io from 'socket.io-client';

import { getApiUrl, getEnv } from '../config';

const socket = io(getApiUrl(), {
  reconnection: true,
});

// Don't connect if we are the server! There should be a better way to do this.
if (getEnv() === 'server') {
  socket.close();
}

export default socket;
