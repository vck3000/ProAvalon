import io from 'socket.io-client';

import apiUrl from '../api/config';

const socket = io(apiUrl, {
  reconnection: false,
});
export default socket;
