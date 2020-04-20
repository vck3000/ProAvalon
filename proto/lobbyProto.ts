import { IsDefined, IsString, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import 'reflect-metadata';

export const SocketEvents = {
  CONNECTED: 'CONNECTED',
  ALL_CHAT_TO_CLIENT: 'ALL_CHAT_TO_CLIENT',
  ALL_CHAT_TO_SERVER: 'ALL_CHAT_TO_SERVER',
  ONLINE_PLAYERS: 'ONLINE_PLAYERS',
  USER_RECONNECT: 'USER_RECONNECT',
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
  CREATE_ROOM = 'CREATE_ROOM',
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
