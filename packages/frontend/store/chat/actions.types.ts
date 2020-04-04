import { IMessage } from './message.types';

// Note, action types must be split out here. Cannot collect into one object.
// Doing so will conflict with Typescript's object type detection in reducers.ts.
export const RECEIVED_MESSAGE = 'RECEIVED_MESSAGE';
export const SET_MESSAGES = 'SET_MESSAGES';
export const GET_ALL_CHAT = 'GET_ALL_CHAT';

// Redux actions
export interface IReceivedMessageAction {
  type: typeof RECEIVED_MESSAGE;
  message: IMessage;
}

export interface ISetMessagesAction {
  type: typeof SET_MESSAGES;
  messages: IMessage[];
}

// Redux Saga actions
export interface IGetAllChatAction {
  type: typeof GET_ALL_CHAT;
}

export type ChatActionTypes = ISetMessagesAction | IReceivedMessageAction;
