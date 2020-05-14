import { ChatResponse } from '../../proto/lobbyProto';
import { ChatType } from './reducers';

// Note, action types must be split out here. Cannot collect into one object.
// Doing so will conflict with Typescript's object type detection in reducers.ts.
export const RECEIVED_MESSAGE = 'RECEIVED_MESSAGE';
export const SET_MESSAGES = 'SET_MESSAGES';
export const EMIT_MESSAGE = 'EMIT_MESSAGE';
export const GET_ALL_CHAT = 'GET_ALL_CHAT';

export interface IReceivedMessageAction {
  type: typeof RECEIVED_MESSAGE;
  payload: {
    type: ChatType;
    message: ChatResponse;
  };
}

export interface ISetMessagesAction {
  type: typeof SET_MESSAGES;
  payload: {
    type: ChatType;
    messages: ChatResponse[];
  };
}

export interface IEmitMessageAction {
  type: typeof EMIT_MESSAGE;
  payload: {
    type: ChatType;
    message: string;
  };
}

// Redux Saga actions
export interface IGetAllChatAction {
  type: typeof GET_ALL_CHAT;
}

export type ChatActionTypes =
  | ISetMessagesAction
  | IReceivedMessageAction
  | IEmitMessageAction;
