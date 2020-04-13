/* eslint-disable @typescript-eslint/no-explicit-any */
import io from 'socket.io-client';
import Cookie from 'js-cookie';

import { getApiUrl } from '../config';
import { SetSocketChatEvents } from './chat';

class SocketConnection {
  private socket!: SocketIOClient.Socket;

  private token: string | undefined;

  constructor() {
    this.token = Cookie.get('AUTH_TOKEN');

    this.setup();
  }

  setup(): void {
    // If we are on the client side
    if (typeof window !== 'undefined') {
      this.socket = io(`${getApiUrl()}/auth`, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        query: {
          token: this.token,
        },
      });

      // TODO Do we need this?
      this.socket.on('reconnection_attempt', () => {
        this.socket.io.opts.query = {
          token: this.token,
        };
      });

      SetSocketChatEvents(this.socket);
    }
  }

  emitProto = (event: string, messageType: any, contents: object): void => {
    if (!this.socket) {
      throw Error('Socket is not connected.');
    }

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
      this.socket.emit(event, Buffer.from(messageType.encode(msg).finish()));
    } else {
      throw TypeError('Bad message type given.');
    }
  };
}

// Only have one instance of this running.
const socket = new SocketConnection();
export default socket;

// import Cookies from 'js-cookie';
// import socket from './socket';

// export const SetSocketAuth = (token: string): void => {
//   const inOneDay = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
//   Cookies.set(
//     'auth__flow__spa__loggedUserObj',
//     { token },
//     { expires: inOneDay },
//   );
//   socket.on('connect', () => {
//     socket
//       .emit('authenticate', { token }) // send the jwt
//       .on('authenticated', () => {
//         // do stuff
//       });
//   });
// };
