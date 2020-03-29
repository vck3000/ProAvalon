import {
  IsConnected,
  ISetConnected,
  SET_CONNECTED,
  IMessage,
  RECEIVED_MESSAGE,
  IReceivedMessageAction,
} from './types';

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
