export const SocketEvents = {
  CONNECTED: 'CONNECTED',
  ALL_CHAT_TO_CLIENT: 'ALL_CHAT_TO_CLIENT',
  ALL_CHAT_TO_SERVER: 'ALL_CHAT_TO_SERVER',
  ONLINE_PLAYERS: 'ONLINE_PLAYERS',
  USER_RECONNECT: 'USER_RECONNECT',
};

export type ChatRequest = {
  text: string;
};

export enum ChatResponseType {
  CHAT = 'CHAT',
  RES_WIN = 'RES_WIN',
  SPY_WIN = 'SPY_WIN',
  PLAYER_JOIN_LOBBY = 'PLAYER_JOIN_LOBBY',
  PLAYER_LEAVE_LOBBY = 'PLAYER_LEAVE_LOBBY',
  CREATE_ROOM = 'CREATE_ROOM',
}

export type ChatResponse = {
  text: string;
  username: string;
  timestamp: Date;
  type: ChatResponseType;
};
