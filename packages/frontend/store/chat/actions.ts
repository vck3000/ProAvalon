import { IMessage } from './message.types';
import {
  IReceivedMessageAction,
  RECEIVED_MESSAGE,
  ISetMessagesAction,
  SET_MESSAGES,
} from './actions.types';

export const receivedMessage = (message: IMessage): IReceivedMessageAction => {
  return {
    type: RECEIVED_MESSAGE,
    message,
  };
};

export const setMessages = (messages: IMessage[]): ISetMessagesAction => {
  return {
    type: SET_MESSAGES,
    messages,
  };
};
