import { SagaIterator } from 'redux-saga';
import { call, takeLatest, fork } from 'redux-saga/effects';
import axios, { AxiosPromise } from 'axios';
import { User, LOGIN, SIGNUP } from './action.types';
import { SetSocketAuth } from '../../socket/auth';

const API_ADDRESS = 'http://localhost:3001';

function post(path: string, data: User): AxiosPromise {
  const url = `${API_ADDRESS}${path}`;

  return axios({
    method: 'post',
    url,
    data,
  });
}

export function* signup(): SagaIterator {
  yield call(post, '/auth/signup', {
    // hardcode values for now
    username: 'test_user',
    password: 'test_password',
    email: 'test@gmail.com',
  });
}

export function* login(): SagaIterator {
  const response = yield call(post, '/auth/login', {
    // hardcode values for now
    username: 'test_user',
    password: 'test_password',
  });
  if (response.data.accessToken) {
    SetSocketAuth(response.data.accessToken);
  }
}

export function* watchSignup(): SagaIterator {
  yield takeLatest(SIGNUP, signup);
}

export function* watchLogin(): SagaIterator {
  yield takeLatest(LOGIN, login);
}

export function* authSaga(): SagaIterator {
  yield fork(watchSignup);
  yield fork(watchLogin);
}
