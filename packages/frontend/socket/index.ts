/* eslint-disable @typescript-eslint/no-explicit-any */
import Router from 'next/router';
import io from 'socket.io-client';
import Cookie from 'js-cookie';
import Swal from 'sweetalert2';

import { getBackendUrl } from '../utils/getEnvVars';
import { SetSocketChatEvents } from './chat';
import { SetSocketPlayersEvents } from './players';

class SocketConnection {
  private socket!: SocketIOClient.Socket;

  private token: string | undefined;

  reinitialize(): void {
    // eslint-disable-next-line no-console
    console.log('Reinitialising socket');

    this.token = Cookie.get('AUTH_TOKEN');

    this.close();

    // If we are on the client side
    if (typeof window !== 'undefined') {
      this.socket = io(getBackendUrl(), {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        query: {
          token: this.token,
        },
      });

      this.socket.on('unauthorized', (/* message: string */) => {
        Swal.fire({
          heightAuto: false,
          title: 'Oops',
          text: 'You are not logged in!',
          icon: 'error',
          confirmButtonText: 'Log in',
          onClose: () => {
            Router.push('/');
          },
        });
      });

      SetSocketPlayersEvents(this.socket);
      SetSocketChatEvents(this.socket);

      this.socket.on('forceDisconnect', () => {
        // Only fire notification if we were in lobby.
        if (Router.route === '/lobby') {
          Swal.fire({
            heightAuto: false,
            title: 'Disconnected!',
            text: 'Please reload the page to reconnect.',
            icon: 'error',
            confirmButtonText: 'Reload lobby',
            showCancelButton: true,
            cancelButtonText: 'Close',
            focusCancel: true,
            reverseButtons: true,
          }).then((result) => {
            if (result.value) {
              Router.reload();
            }
          });
        }
      });
    }
  }

  close = (): void => {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  };

  emit = (event: string, message: any): void => {
    this.socket.emit(event, message);
  };

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
