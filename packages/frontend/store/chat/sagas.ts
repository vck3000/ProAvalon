import axios, { AxiosResponse } from 'axios';
import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest, fork } from 'redux-saga/effects';

import { ChatResponse, ChatResponses } from '../../proto/bundle';
import { getApiUrl } from '../../config';
import { SET_MESSAGES, GET_ALL_CHAT } from './actions.types';

function get(
  path: string,
): Promise<AxiosResponse<ChatResponse[]> | ChatResponse[]> {
  const url = `${getApiUrl()}${path}`;

  return axios({
    method: 'get',
    url,
    responseType: 'arraybuffer',
  }).then((resp) => resp);
}

function* getAllChat(): SagaIterator {
  const messages = yield call(get, '/allchat');
  const decoded = ChatResponses.decode(new Uint8Array(messages.data));
  yield put({ type: SET_MESSAGES, messages: decoded.chatResponses });
}

function* watchGetAllChat(): SagaIterator {
  yield takeLatest(GET_ALL_CHAT, getAllChat);
}

export function* chatSaga(): SagaIterator {
  yield fork(watchGetAllChat);
}
