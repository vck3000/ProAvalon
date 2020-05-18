import {
  IsDefined,
  IsString,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import 'reflect-metadata';

export const SocketEvents = {
  AUTHORIZED: 'AUTHORIZED',
  ALL_CHAT_TO_CLIENT: 'ALL_CHAT_TO_CLIENT',
  ALL_CHAT_TO_SERVER: 'ALL_CHAT_TO_SERVER',
  ONLINE_PLAYERS: 'ONLINE_PLAYERS',
  USER_RECONNECT: 'USER_RECONNECT',

  CREATE_GAME: 'CREATE_GAME',
  JOIN_GAME: 'JOIN_GAME',
  LEAVE_GAME: 'LEAVE_GAME',
  GAME_CHAT_TO_CLIENT: 'GAME_CHAT_TO_CLIENT',
  GAME_CHAT_TO_SERVER: 'GAME_CHAT_TO_SERVER',
};

export class ChatRequest {
  @IsDefined()
  @IsString()
  text!: string;
}

export enum ChatResponseType {
  CHAT = 'CHAT',
  RES_WIN = 'RES_WIN',
  SPY_WIN = 'SPY_WIN',
  PLAYER_JOIN_LOBBY = 'PLAYER_JOIN_LOBBY',
  PLAYER_LEAVE_LOBBY = 'PLAYER_LEAVE_LOBBY',
  PLAYER_JOIN_GAME = 'PLAYER_JOIN_GAME',
  PLAYER_LEAVE_GAME = 'PLAYER_LEAVE_GAME',
  CREATE_GAME = 'CREATE_GAME',
  USER_COMMAND = 'USER_COMMAND',
}

export class ChatResponse {
  @IsDefined()
  @IsString()
  text!: string;

  @IsDefined()
  @IsString()
  username!: string;

  @IsDefined()
  @IsDate()
  @Type(() => Date)
  timestamp!: Date;

  @IsDefined()
  @IsEnum(ChatResponseType)
  type!: ChatResponseType;
}

// empty
export enum OnlinePlayerRewards {}

export class OnlinePlayer {
  @IsString()
  @IsDefined()
  username!: string;

  @IsDefined()
  rewards!: OnlinePlayerRewards[];
}

export enum GameMode {
  VANILLA = 'VANILLA',
  AVALON = 'AVALON',
}
export class CreateGameDto {
  // No need for validators here as it is validated within GameState
  @IsInt()
  @Min(0)
  @Max(10)
  maxNumPlayers!: number;

  @IsOptional()
  @IsString()
  joinPassword!: string | undefined;

  @IsEnum(GameMode)
  gameMode!: GameMode;
}

export class JoinGame {
  @IsNumber()
  @IsDefined()
  id!: number;
}

export class LeaveGame {
  @IsNumber()
  @IsDefined()
  id!: number;
}
