import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    // eslint-disable-next-line no-console
    console.log(`connected to ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    // eslint-disable-next-line no-console
    console.log(`disconnected from ${client.id}`);
  }

  @SubscribeMessage('msgToServer')
  async handleMessage(_client: Socket, messageText: string) {
    this.chatService.storeMessage({
      timestamp: new Date(),
      username: 'nikolaj',
      messageText,
      type: 'chat',
    });
    this.server.emit('msgToClient', this.chatService.getLastMessage());
  }
}
