import { IsDefined, IsString, IsDate, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import 'reflect-metadata';
import { MissionOutcome } from './game';

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

  UPDATE_LOBBY_GAMES: 'UPDATE_LOBBY_GAMES',
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
  @IsEnum(OnlinePlayerRewards, { each: true })
  rewards!: OnlinePlayerRewards[];
}

export class LobbyRoomData {
  @IsNumber()
  id!: number;

  @IsString()
  host!: string;

  @IsString()
  mode!: string;

  @IsNumber()
  numSpectators!: number;

  @IsString({
    each: true,
  })
  avatarLinks!: string[];

  @IsEnum(MissionOutcome, {
    each: true,
  })
  missionOutcome!: MissionOutcome[];
}
