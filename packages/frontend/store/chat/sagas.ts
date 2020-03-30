import axios, { AxiosResponse } from 'axios';
import { SagaIterator } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { IMessage } from './types';

const API_ADDRESS = 'http://localhost:3001';

export function get(
  path: string,
): Promise<AxiosResponse<IMessage[]> | IMessage[]> {
  const url = `${API_ADDRESS}${path}`;

  return axios({
    method: 'get',
    url,
  }).then((resp: { data: IMessage[] }) => resp.data);
}

export function* getAllChat(): SagaIterator {
  const messages = yield call(get, '/messages');
  yield put({ type: 'SET_MESSAGES', messages });
}
