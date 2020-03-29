import io from 'socket.io-client';

const socket = io('http://localhost:3001');
socket.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log(`connected to ${socket.id}`);
});
export default socket;
