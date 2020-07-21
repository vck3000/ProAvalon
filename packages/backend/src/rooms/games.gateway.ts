import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@WebSocketGateway()
export class GamesGateway {
  @WebSocketServer() server!: Server;

  // private readonly logger = new Logger(GamesGateway.name);
}
