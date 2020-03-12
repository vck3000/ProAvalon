import { SagaIterator } from 'redux-saga';
import { put, call, takeLatest } from 'redux-saga/effects';
import Cookies from 'js-cookie';
import { post } from './apis';

import {
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,
  ILoginUserAction,
  LOGIN_USER,
} from './types';

export function* login(action: ILoginUserAction): SagaIterator {
  try {
    const response = yield call(post, '/login', action.loginDetails);
    const inOneWeek = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 7));
    if (response.data.isAuthenticated) {
      Cookies.set('auth__flow__spa__loggedUserObj', response.data, { expires: inOneWeek });
      yield put({ type: LOGIN_USER_SUCCESS, username: response.data.username });
    }
  } catch(error) {
    yield put({ type: LOGIN_USER_ERROR, error });
  }
}

export function* watchLogin(): SagaIterator {
  yield takeLatest(LOGIN_USER, login);
}
