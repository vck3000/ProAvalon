import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JWT_SECRET } from '../getEnvVars';

import socketioJwt = require('socketio-jwt');

interface CustomSocket extends Socket {
  // eslint-disable-next-line camelcase
  decoded_token: {
    name: string;
  };
}

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  async handleConnection() {
    socketioJwt.authorize({
      secret: JWT_SECRET,
      timeout: 15000, // 15 seconds to send the authentication message
      decodedPropertyName: 'decoded_token',
    });
  }

  @SubscribeMessage('authenticated')
  async onAuthenticated(socket: CustomSocket) {
    // eslint-disable-next-line no-console
    console.log(socket.decoded_token);
  }
}
