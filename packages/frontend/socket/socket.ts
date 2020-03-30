import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  reconnection: false,
});
export default socket;
