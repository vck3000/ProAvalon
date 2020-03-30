export const RECEIVED_MESSAGE = 'RECEIVED_MESSAGE';
export const SET_MESSAGES = 'SET_MESSAGES';

export type MessageType =
  | 'chat'
  | 'res_win'
  | 'spy_win'
  | 'player_join_lobby'
  | 'player_leave_lobby'
  | 'create_room';

export interface IMessage {
  timestamp: Date;
  username: string;
  text: string;
  type: MessageType;
}

export interface IReceivedMessageAction {
  type: typeof RECEIVED_MESSAGE;
  message: IMessage;
}

export interface ISetMessagesAction {
  type: typeof SET_MESSAGES;
  messages: IMessage[];
}

export interface IChatState {
  messages: IMessage[];
}

export type ChatActionTypes = ISetMessagesAction | IReceivedMessageAction;
