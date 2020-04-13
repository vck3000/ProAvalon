import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
// import { JWT_SECRET } from '../getEnvVars';

// import socketioJwt = require('socketio-jwt');

interface CustomSocket extends Socket {
  // eslint-disable-next-line camelcase
  decoded_token: {
    name: string;
  };
}

@WebSocketGateway({ namespace: 'auth' })
export class AuthGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(AuthGateway.name);

  async handleConnection() {
    this.logger.log('New connection from auth.');
    const count = Object.keys(this.server.sockets).length;
    this.logger.log(`auth: Online player count: ${count}.`);
  }

  @SubscribeMessage('authenticated')
  async onAuthenticated(socket: CustomSocket) {
    // eslint-disable-next-line no-console
    console.log(socket.decoded_token);
  }
}
