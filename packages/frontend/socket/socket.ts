import io from 'socket.io-client';

import getApiUrl from '../api/config';

const socket = io(getApiUrl(), {
  reconnection: false,
});
export default socket;
