import { SagaIterator } from 'redux-saga';
import { call, takeLatest, fork, put } from 'redux-saga/effects';
import Cookie from 'js-cookie';
import { LOGIN, SIGNUP, ISignupAction, ILoginAction } from './action.types';
// import { SetSocketAuth } from '../../socket/auth';
import { Post } from '../../axios';

import { login as loginAction } from './actions';

export function* signup(action: ISignupAction): SagaIterator {
  yield call(Post, '/auth/signup', {
    username: action.username,
    password: action.password,
    email: action.email,
  });

  // Login after a successful signup.
  yield put(
    loginAction({ username: action.username, password: action.password }),
  );
}

export function* login(action: ILoginAction): SagaIterator {
  const response = yield call(Post, '/auth/login', {
    username: action.username,
    password: action.password,
  });

  if (response.data.token) {
    yield call(Cookie.set, 'AUTH_TOKEN', response.data.token);
    // TODO Restart sockets with the new authentication token.
  } else {
    // TODO
    throw Error('Login failed!');
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
