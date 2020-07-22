import { Logger } from '@nestjs/common';
import { interpret, Interpreter, State } from 'xstate';
import { transformAndValidate } from '@proavalon/proto';
import {
  CreateRoomDto,
  RoomData,
  RoomSocketEvents,
  RoomState,
  PlayerData,
} from '@proavalon/proto/room';
import { MissionOutcome } from '@proavalon/proto/game';
import { LobbyRoomData, OnlinePlayer } from '@proavalon/proto/lobby';
import { RoomMachine } from './game-engine/room/room-machine';
import {
  RoomContext,
  RoomStateSchema,
  RoomEvents,
  PlayerInfo,
} from './game-engine/room/rooms-machine-types';
import { SocketUser } from '../users/users.socket';
import RedisAdapterService from '../redis-adapter/redis-adapter.service';
import { filterByComponent } from './game-engine/util';
import { CPlayer } from './game-engine/ecs/game-components';
// const gameLogger = new Logger('Game');

export default class Room {
  private readonly logger: Logger;

  private machine: Interpreter<RoomContext, RoomStateSchema, RoomEvents, any>;

  constructor(gameString: string) {
    this.logger = new Logger(Room.name);

    // Restore the machine
    const previousState = State.create<RoomContext, RoomEvents>(
      JSON.parse(gameString),
    );
    const resolvedState = RoomMachine.resolveState(previousState);
    this.machine = interpret(RoomMachine).start(resolvedState);
  }

  // ----------- Static methods -------------
  static async createNewGameState(
    socket: SocketUser,
    data: CreateRoomDto,
    id: number,
  ): Promise<State<RoomContext, RoomEvents, RoomStateSchema> | null> {
    const newMachine = interpret(RoomMachine).start();
    // TODO Send in the data
    newMachine.send('INITIAL_SETTINGS', {
      id,
      host: socket.user.displayUsername,
    });

    // Verify the data
    await transformAndValidate(CreateRoomDto, data);

    return newMachine.state;
  }

  // ----------- Helper methods -------------
  getPlayerInfo(socket: SocketUser): PlayerInfo {
    return {
      socketId: socket.id,
      displayUsername: socket.user.displayUsername,
    };
  }

  // ----------- Instance methods -------------
  getChat() {
    this.logger.log('Getting full chat...');
    // Fetch from redis database
  }

  getState() {
    return this.machine.state;
  }

  sendRoomDataToSocket(socket: SocketUser) {
    const roomData = this.getRoomDataToUser();
    return socket.emit(RoomSocketEvents.UPDATE_ROOM, roomData);
  }

  sendRoomDataToAll(redisAdapter: RedisAdapterService) {
    const gameId = this.machine.state.context.roomData.id;
    const roomData = this.getRoomDataToUser();

    return redisAdapter.server
      .to(`game:${gameId}`)
      .emit(RoomSocketEvents.UPDATE_ROOM, roomData);
  }

  getLobbyRoomData(): LobbyRoomData {
    const { context } = this.machine.state;
    const machineRoomData = context.roomData;

    const { entities } = context;
    const playerEntities = filterByComponent(entities, CPlayer.name);

    const numSpectators = playerEntities.filter(
      (e) => !(e.components[CPlayer.name] as CPlayer).satDown,
    ).length;

    return {
      ...machineRoomData,
      numSpectators,
      avatarLinks: [
        'http://cdn.discordapp.com/attachments/430166478193688597/481009331622510602/pronub-res.png',
        'http://cdn.discordapp.com/attachments/430166478193688597/481009331622510602/pronub-res.png',
        '/game_room/base-res.png',
        '/game_room/base-res.png',
        '/game_room/base-res.png',
        '/game_room/base-res.png',
        '/game_room/base-res.png',
      ],
      missionOutcome: [MissionOutcome.fail, MissionOutcome.success],
    };
  }

  getRoomDataToUser(): RoomData {
    const { context } = this.machine.state;
    const { entities } = context;
    const machineRoomData = context.roomData;

    const playerEntities = filterByComponent(entities, CPlayer.name);

    const playerData: PlayerData[] = playerEntities
      .filter((e) => (e.components[CPlayer.name] as CPlayer).satDown)
      .map((e) => ({
        displayUsername: (e.components[CPlayer.name] as CPlayer)
          .displayUsername,
      }));

    const spectatorData: OnlinePlayer[] = playerEntities
      .filter((e) => !(e.components[CPlayer.name] as CPlayer).satDown)
      .map((e) => ({
        displayUsername: (e.components[CPlayer.name] as CPlayer)
          .displayUsername,
      }));

    return {
      ...machineRoomData,
      state: this.machine.state.value as RoomState,
      playerData,
      spectatorData,
    };
  }

  roomEvent(socket: SocketUser, event: RoomSocketEvents, data: any) {
    const playerInfo = this.getPlayerInfo(socket);

    this.logger.log(
      `Username: ${socket.user.displayUsername}, Event: ${event}`,
    );

    // Intentionally do a type change here to map it over
    this.machine.send((event as unknown) as RoomEvents, {
      player: playerInfo,
      // Attach on any data the user gave?
      // TODO Make data properly typed? What are expecting? Usually target data.
      ...data,
    });
  }
}
