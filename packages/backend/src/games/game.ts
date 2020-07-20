import { Logger } from '@nestjs/common';
import { interpret, Interpreter, State } from 'xstate';
import { transformAndValidate } from '@proavalon/proto';
import { CreateRoomDto, RoomData } from '@proavalon/proto/room';
import { MissionOutcome } from '@proavalon/proto/game';
import { LobbyRoomData } from '@proavalon/proto/lobby';
import {
  RoomContext,
  RoomStateSchema,
  RoomEvents,
  RoomMachine,
} from './game-engine/room/room-machine';
import { SocketUser } from '../users/users.socket';

const gameLogger = new Logger('Game');

export default class Game {
  private readonly logger: Logger;

  private machine: Interpreter<RoomContext, RoomStateSchema, RoomEvents, any>;

  constructor(gameString: string) {
    this.logger = new Logger(Game.name);

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

    // Verify the data
    await transformAndValidate(CreateRoomDto, data);

    gameLogger.log('Passed validation');
    gameLogger.log(id, socket.user.displayUsername);

    return newMachine.state;
  }

  // ----------- Instance methods -------------
  getChat() {
    this.logger.log('Getting full chat...');
    // Fetch from redis database
  }

  // TODO
  getMissionHistory(): MissionOutcome[] {
    return [MissionOutcome.success, MissionOutcome.fail];
  }

  getRoomDataToUser(): RoomData {
    return this.machine.state.context.roomDataToUser;
  }

  getLobbyRoomDataToUser(): LobbyRoomData {
    return this.machine.state.context.lobbyRoomDataToUser;
  }
}
