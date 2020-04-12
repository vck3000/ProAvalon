import Cookies from 'js-cookie';
import socket from './socket';

export const SetSocketAuth = (token: string): void => {
  const inOneDay = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
  Cookies.set(
    'auth__flow__spa__loggedUserObj',
    { token },
    { expires: inOneDay },
  );
  socket.on('connect', () => {
    socket
      .emit('authenticate', { token }) // send the jwt
      .on('authenticated', () => {
        // do stuff
      });
  });
};
