import { IMessage } from './message.types';

export const RECEIVED_MESSAGE = 'RECEIVED_MESSAGE';
export const SET_MESSAGES = 'SET_MESSAGES';

export interface IReceivedMessageAction {
  type: typeof RECEIVED_MESSAGE;
  message: IMessage;
}

export interface ISetMessagesAction {
  type: typeof SET_MESSAGES;
  messages: IMessage[];
}

export type ChatActionTypes = ISetMessagesAction | IReceivedMessageAction;
