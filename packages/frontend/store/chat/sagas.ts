import axios, { AxiosResponse } from 'axios';
import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest, fork } from 'redux-saga/effects';

import { ChatResponse } from '../../proto/lobbyProto';
import { getBackendUrl } from '../../utils/getEnvVars';
import { SET_MESSAGES, GET_ALL_CHAT } from './actions.types';

function get(
  path: string,
): Promise<AxiosResponse<ChatResponse[]> | ChatResponse[]> {
  const url = `${getBackendUrl()}${path}`;

  return axios({
    method: 'get',
    url,
    // responseType: 'arraybuffer',
  }).then((resp) => resp.data);
}

function* getAllChat(): SagaIterator {
  const chatResponses = (yield call(get, '/allchat')) as ChatResponse[];

  for (let i = 0; i < chatResponses.length; i += 1) {
    chatResponses[i].timestamp = new Date(chatResponses[i].timestamp);
  }

  // eslint-disable-next-line no-console
  console.log(chatResponses);
  yield put({ type: SET_MESSAGES, messages: chatResponses });
}

function* watchGetAllChat(): SagaIterator {
  yield takeLatest(GET_ALL_CHAT, getAllChat);
}

export function* chatSaga(): SagaIterator {
  yield fork(watchGetAllChat);
}
