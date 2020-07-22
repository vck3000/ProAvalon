import {
  IsNumber,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { OnlinePlayer } from './lobby';

export enum GameMode {
  VANILLA = 'VANILLA',
  AVALON = 'AVALON',
}

export enum RoomSocketEvents {
  CREATE_ROOM = 'CREATE_ROOM',
  START_GAME = 'START_GAME',

  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',

  SIT_DOWN = 'SIT_DOWN',
  STAND_UP = 'STAND_UP',

  ROOM_CHAT_TO_CLIENT = 'ROOM_CHAT_TO_CLIENT',
  ROOM_CHAT_TO_SERVER = 'ROOM_CHAT_TO_SERVER',

  UPDATE_ROOM = 'UPDATE_ROOM',
}

// Game Data
export enum RoomState {
  waiting = 'waiting',
  game = 'game',
  finished = 'finished',
}

export class PlayerData {
  @IsString()
  displayUsername!: string;

  @IsString()
  avatarLink?: string;
}

export class RoomData {
  @IsInt()
  id!: number;

  @IsEnum(RoomState)
  state!: RoomState;

  @IsString()
  host!: string; // holds a displayUsername

  @IsEnum(GameMode)
  mode!: GameMode;

  // TODO Replace with allowed roles
  @IsString({
    each: true,
  })
  roles!: string[];

  @ValidateNested({ each: true })
  playerData!: PlayerData[];

  @ValidateNested({ each: true })
  spectatorData!: OnlinePlayer[];

  @IsString({
    each: true,
  })
  kickedPlayers!: string[]; // holds usernames (lowercased)

  @IsString()
  gameBarMsg!: string;
}

export class CreateRoomDto {
  // No need for validators here as it is validated within GameState
  @IsInt()
  @Min(0)
  @Max(10)
  maxNumPlayers!: number;

  @IsOptional()
  @IsString()
  joinPassword!: string | undefined;

  @IsEnum(GameMode)
  mode!: GameMode;
}

export class GameIdDto {
  @IsNumber()
  id!: number;
}
