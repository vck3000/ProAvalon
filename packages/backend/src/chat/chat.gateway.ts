import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { Message } from './interfaces/message.interface';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    const msg = this.chatService.storeMessage({
      timestamp: new Date(),
      username: 'nikolaj',
      text: `${client.id} has joined the lobby`,
      type: 'player_join_lobby',
    });
    this.server.emit('allChatToClient', msg);
  }

  async handleDisconnect(client: Socket) {
    const msg = this.chatService.storeMessage({
      timestamp: new Date(),
      username: 'nikolaj',
      text: `${client.id} has left the lobby`,
      type: 'player_leave_lobby',
    });
    this.server.emit('allChatToClient', msg);
  }

  @SubscribeMessage('allChatToServer')
  async handleMessage(client: Socket, text: Message['text']) {
    if (text) {
      const msg = this.chatService.storeMessage({
        timestamp: new Date(),
        username: client.id,
        text,
        type: 'chat',
      });
      this.server.emit('allChatToClient', msg);
    }
  }
}
