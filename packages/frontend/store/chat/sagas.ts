import axios, { AxiosResponse } from 'axios';
import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest, fork } from 'redux-saga/effects';

import { IMessage } from './message.types';
import getApiUrl from '../../api/config';
import { SET_MESSAGES, GET_ALL_CHAT } from './actions.types';

function get(path: string): Promise<AxiosResponse<IMessage[]> | IMessage[]> {
  const url = `${getApiUrl()}${path}`;

  return axios({
    method: 'get',
    url,
  }).then((resp: { data: IMessage[] }) => resp.data);
}

function* getAllChat(): SagaIterator {
  const messages = yield call(get, '/allchat');
  yield put({ type: SET_MESSAGES, messages });
}

function* watchGetAllChat(): SagaIterator {
  yield takeLatest(GET_ALL_CHAT, getAllChat);
}

export function* chatSaga(): SagaIterator {
  yield fork(watchGetAllChat);
}
