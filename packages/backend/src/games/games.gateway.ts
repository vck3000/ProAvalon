import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { transformAndValidate } from '@proavalon/proto';
import {
  SocketEvents,
  ChatResponse,
  ChatResponseType,
  ChatRequest,
} from '@proavalon/proto/lobby';
import { CreateRoomDto, JoinGame, LeaveGame } from '@proavalon/proto/room';

import { GamesService } from './games.service';
import { SocketUser } from '../users/users.socket';
// import RedisAdapterService from '../redis-adapter/redis-adapter.service';
import { CommandsService } from '../commands/commands.service';

@WebSocketGateway()
export class GamesGateway {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(GamesGateway.name);

  constructor(
    private gamesService: GamesService,
    // private redisAdapter: RedisAdapterService,
    private commandsService: CommandsService,
  ) {}

  getSocketGameId = (socket: SocketUser) => {
    const gameRooms = Object.keys(socket.rooms).filter((room) =>
      room.includes('game'),
    );

    // Get the user's possible game rooms
    if (gameRooms.length !== 1) {
      this.logger
        .warn(`${socket.user.displayUsername} does not have a single joined \
            game. They are currently in: ${gameRooms}`);
      return {
        room: '-1',
        gameId: -1,
      };
    }

    // socket.io-redis room name: 'game<id>'
    const room = gameRooms[0];
    const gameId = parseInt(room.replace('game:', ''), 10);

    return {
      room,
      gameId,
    };
  };

  @SubscribeMessage(SocketEvents.GAME_CHAT_TO_SERVER)
  async handleGameChat(socket: SocketUser, chatRequest: ChatRequest) {
    if (chatRequest.text) {
      // Commands
      if (chatRequest.text[0] === '/') {
        this.commandsService.runCommand(chatRequest.text, socket);
        return undefined;
      }

      const { room, gameId } = this.getSocketGameId(socket);

      // Chat message
      this.logger.log(
        `Game ${gameId} chat message: ${socket.user.username}: ${chatRequest.text} `,
      );

      try {
        const chatResponse = await transformAndValidate(ChatResponse, {
          text: chatRequest.text,
          username: socket.user.displayUsername,
          timestamp: new Date(),
          type: ChatResponseType.CHAT,
        });

        this.gamesService.storeChat(gameId, chatResponse);

        this.server
          .to(room)
          .emit(SocketEvents.GAME_CHAT_TO_CLIENT, chatResponse);
      } catch (err) {
        this.logger.error('Validation failed. Error: ', err);
      }
    }
    return undefined;
  }

  @SubscribeMessage(SocketEvents.CREATE_GAME)
  async handleCreateGame(socket: SocketUser, data: CreateRoomDto) {
    this.logger.log('Received create game request');

    const newGameId = await this.gamesService.createGame(socket, data);

    const msg = await transformAndValidate(ChatResponse, {
      text: `${socket.user.displayUsername} has created room ${newGameId}`,
      username: socket.user.displayUsername,
      timestamp: new Date(),
      type: ChatResponseType.CREATE_GAME,
    });

    this.server.to('lobby').emit(SocketEvents.ALL_CHAT_TO_CLIENT, msg);

    return newGameId;
  }

  @SubscribeMessage(SocketEvents.JOIN_GAME)
  async handleJoinGame(socket: SocketUser, joinGame: JoinGame) {
    if (joinGame.id && (await this.gamesService.hasGame(joinGame.id))) {
      // Join the socket io room
      socket.join(`game:${joinGame.id}`);

      // Send the room data to user
      this.gamesService.sendRoomDataToUser(socket, joinGame.id);

      this.logger.log(
        `${socket.user.displayUsername} has joined game ${joinGame.id}.`,
      );

      // Send message to users
      try {
        const joinMessage = await transformAndValidate(ChatResponse, {
          text: `${socket.user.displayUsername} has joined the room.`,
          username: socket.user.displayUsername,
          timestamp: new Date(),
          type: ChatResponseType.PLAYER_JOIN_GAME,
        });

        this.server
          .to(`game:${joinGame.id}`)
          .emit(SocketEvents.GAME_CHAT_TO_CLIENT, joinMessage);
      } catch (err) {
        this.logger.error('Validation failed. Error: ', err);
      }
      return 'OK';
    }
    return `Game ${joinGame.id} not found.`;
  }

  @SubscribeMessage(SocketEvents.LEAVE_GAME)
  async handleLeaveGame(socket: SocketUser, leaveGame: LeaveGame) {
    if (leaveGame.id && (await this.gamesService.hasGame(leaveGame.id))) {
      // Leave the socket io room
      socket.leave(`game:${leaveGame.id}`);

      this.logger.log(
        `${socket.user.displayUsername} has left game ${leaveGame.id}.`,
      );

      // Send message to users
      try {
        const chatResponse = await transformAndValidate(ChatResponse, {
          text: `${socket.user.displayUsername} has left the room.`,
          username: socket.user.displayUsername,
          timestamp: new Date(),
          type: ChatResponseType.PLAYER_LEAVE_GAME,
        });

        this.gamesService.storeChat(leaveGame.id, chatResponse);

        this.server
          .to(`game:${leaveGame.id}`)
          .emit(SocketEvents.GAME_CHAT_TO_CLIENT, chatResponse);

        // TODO Remove room if no one is left and game has not started.
      } catch (err) {
        this.logger.error('Validation failed. Error: ', err);
      }
      return 'OK';
    }
    return `Game ${leaveGame.id} not found.`;
  }
}
