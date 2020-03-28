import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { Message } from './types/Message.type';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(private chatService: ChatService) {}

  async handleConnection() {
    // console.log('connected');
  }

  async handleDisconnect() {
    // console.log('disconnected');
  }

  @SubscribeMessage('msgToServer')
  async handleMessage(_client: Socket, message: Message) {
    this.chatService.storeMessage({
      ...message,
      id: this.chatService.size().toString(),
    });
    this.server.emit('msgToClient', this.chatService.getLastMessage());
  }
}
