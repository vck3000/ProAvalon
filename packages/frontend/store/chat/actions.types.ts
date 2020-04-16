import { ChatResponse } from '../../proto/lobbyProto';

// Note, action types must be split out here. Cannot collect into one object.
// Doing so will conflict with Typescript's object type detection in reducers.ts.
export const RECEIVED_MESSAGE = 'RECEIVED_MESSAGE';
export const SET_MESSAGES = 'SET_MESSAGES';
export const GET_ALL_CHAT = 'GET_ALL_CHAT';

// Redux actions
export interface IReceivedMessageAction {
  type: typeof RECEIVED_MESSAGE;
  message: ChatResponse;
}

export interface ISetMessagesAction {
  type: typeof SET_MESSAGES;
  messages: ChatResponse[];
}

// Redux Saga actions
export interface IGetAllChatAction {
  type: typeof GET_ALL_CHAT;
}

export type ChatActionTypes = ISetMessagesAction | IReceivedMessageAction;
