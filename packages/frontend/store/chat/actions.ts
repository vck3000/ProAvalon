import {
  IsConnected,
  ISetConnected,
  SET_CONNECTED,
  IMessage,
  SET_MESSAGE,
  RECEIVED_MESSAGE,
  ISetMessageAction,
  IReceivedMessageAction,
} from './types';

export const setMessage = (
  messageText: IMessage['messageText'],
): ISetMessageAction => {
  return {
    type: SET_MESSAGE,
    messageText,
  };
};

export const receivedMessage = (message: IMessage): IReceivedMessageAction => {
  return {
    type: RECEIVED_MESSAGE,
    message,
  };
};

export const setConnected = (isConnected: IsConnected): ISetConnected => {
  return {
    type: SET_CONNECTED,
    isConnected,
  };
};
