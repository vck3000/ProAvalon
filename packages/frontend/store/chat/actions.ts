import {
  IReceivedMessageAction,
  ISetMessagesAction,
  IGetAllChatAction,
  RECEIVED_MESSAGE,
  SET_MESSAGES,
  GET_ALL_CHAT,
  IEmitMessageAction,
  ChatActionTypes,
  EMIT_MESSAGE,
} from './types';

export const receivedMessage = (
  payload: IReceivedMessageAction['payload'],
): IReceivedMessageAction => {
  return {
    type: RECEIVED_MESSAGE,
    payload,
  };
};

export const setMessages = (
  payload: ISetMessagesAction['payload'],
): ISetMessagesAction => {
  return {
    type: SET_MESSAGES,
    payload,
  };
};

export const emitMessage = (
  payload: IEmitMessageAction['payload'],
): ChatActionTypes => {
  return {
    type: EMIT_MESSAGE,
    payload,
  };
};

export const getAllChat = (): IGetAllChatAction => {
  return {
    type: GET_ALL_CHAT,
  };
};
