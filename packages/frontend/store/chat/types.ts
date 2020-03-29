export const RECEIVED_MESSAGE = 'RECEIVED_MESSAGE';
export const SET_CONNECTED = 'SET_CONNECTED';

export type IsConnected = boolean;
export type MessageType =
  | 'chat'
  | 'res_win'
  | 'spy_win'
  | 'player_join_lobby'
  | 'player_leave_lobby'
  | 'create_room';

export interface IMessage {
  id?: string;
  timestamp: Date;
  username: string;
  messageText: string;
  type: MessageType;
}

export interface ISetConnected {
  type: typeof SET_CONNECTED;
  isConnected: IsConnected;
}

export interface IReceivedMessageAction {
  type: typeof RECEIVED_MESSAGE;
  message: IMessage;
}

export interface IChatState {
  messages: IMessage[];
  isConnected: IsConnected;
}

export type ChatActionTypes = ISetConnected | IReceivedMessageAction;
