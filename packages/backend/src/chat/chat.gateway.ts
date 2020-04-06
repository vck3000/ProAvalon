import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatRequest, ChatResponse } from '../../proto/bundle';
import { getProtoTimestamp } from '../../proto/timestamp';
import SocketEvents from '../../proto/socketEvents';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Player joined lobby: ${client.id}.`);

    // Player join message
    const chatResponse = ChatResponse.create({
      text: `${client.id} has joined the lobby`,
      timestamp: getProtoTimestamp(),
      username: client.id,
      type: ChatResponse.ChatResponseType.PLAYER_JOIN_LOBBY,
    });
    this.chatService.storeMessage(chatResponse);
    this.server.emit(
      SocketEvents.ALL_CHAT_TO_CLIENT,
      ChatResponse.encode(chatResponse).finish(),
    );

    // Online player count message
    const count = Object.keys(this.server.sockets.sockets).length;
    this.logger.log(`Online player count: ${count}.`);
    const onlinePlayerCountMsg = ChatResponse.create({
      text: `There are ${count} players connected!`,
      timestamp: getProtoTimestamp(),
      username: client.id,
      type: ChatResponse.ChatResponseType.CREATE_ROOM,
    });
    this.chatService.storeMessage(onlinePlayerCountMsg);
    this.server.emit(
      SocketEvents.ALL_CHAT_TO_CLIENT,
      ChatResponse.encode(onlinePlayerCountMsg).finish(),
    );
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Player left lobby: ${client.id}.`);

    const chatResponse = ChatResponse.create({
      text: `${client.id} has left the lobby`,
      timestamp: getProtoTimestamp(),
      username: client.id,
      type: ChatResponse.ChatResponseType.PLAYER_LEAVE_LOBBY,
    });
    this.chatService.storeMessage(chatResponse);
    this.server.emit(
      SocketEvents.ALL_CHAT_TO_CLIENT,
      ChatResponse.encode(chatResponse).finish(),
    );

    // Online player count message
    const count = Object.keys(this.server.sockets.sockets).length;
    this.logger.log(`Online player count: ${count}.`);
    const onlinePlayerCountMsg = ChatResponse.create({
      text: `There are ${count} players connected!`,
      timestamp: getProtoTimestamp(),
      username: client.id,
      type: ChatResponse.ChatResponseType.CREATE_ROOM,
    });
    this.chatService.storeMessage(onlinePlayerCountMsg);
    this.server.emit(
      SocketEvents.ALL_CHAT_TO_CLIENT,
      ChatResponse.encode(onlinePlayerCountMsg).finish(),
    );
  }

  @SubscribeMessage(SocketEvents.ALL_CHAT_TO_SERVER)
  async handleMessage(client: Socket, chatRequest: any) {
    const obj = JSON.parse(JSON.stringify(chatRequest));
    const size = Object.keys(obj).length;
    const arr = new Uint8Array(size);
    for (let i = 0; i < size; i += 1) {
      arr[i] = chatRequest[i];
    }

    // Decode
    const decoded = ChatRequest.decode(arr);

    if (decoded.text) {
      this.logger.log(`All chat message: ${client.id}: ${decoded.text} `);

      const chatResponse = ChatResponse.create({
        text: decoded.text,
        username: client.id,
        timestamp: getProtoTimestamp(),
        type: ChatResponse.ChatResponseType.CHAT,
      });

      this.chatService.storeMessage(chatResponse);
      this.server.emit(
        SocketEvents.ALL_CHAT_TO_CLIENT,
        ChatResponse.encode(chatResponse).finish(),
      );
    }
  }
}
