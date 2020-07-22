import { SagaIterator } from 'redux-saga';
import { call, takeLatest, fork, put } from 'redux-saga/effects';
import Cookie from 'js-cookie';
import Swal from 'sweetalert2';

import { socket } from '../../socket';

import {
  LOGIN,
  SIGNUP,
  ISignupAction,
  ILoginAction,
  LOGOUT,
  LOGIN_SUCCESS,
} from './types';
import { Post } from '../../axios';

import {
  login as loginAction,
  loginSuccess as loginSuccessAction,
} from './actions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SwalCall = (opts: any): Promise<void> => {
  return new Promise((resolve) => {
    Swal.fire({
      heightAuto: false,
      ...opts,
      onClose: () => {
        resolve();
      },
    });
  });
};

export function* signup(action: ISignupAction): SagaIterator {
  const {
    payload: { username, password, email },
  } = action;
  try {
    const res = yield call(Post, '/auth/signup', {
      username,
      password,
      email,
    });

    yield call(SwalCall, {
      title: 'Success!',
      text: res.data,
      icon: 'success',
    });

    // Login after a successful signup.
    yield put(loginAction({ username, password }));
  } catch (e) {
    yield call(SwalCall, {
      title: 'Oops',
      text: e.response.data.message ? e.response.data.message : e.response.data,
      icon: 'error',
    });
  }
}

export function* login({
  payload: { username, password },
}: ILoginAction): SagaIterator {
  try {
    const response = yield call(Post, '/auth/login', {
      username,
      password,
    });

    yield call(Cookie.set, 'AUTH_TOKEN', response.data.token, {
      // TODO: This is causing issues on local environments where it is http. Maybe make this an env var?
      // secure: true,
      expires: response.data.expires / 86400, // Convert seconds to number of days (as float)
    });

    // TODO: settings should not be hardcoded. Either get the data from the server or tap localstorage
    yield put(
      loginSuccessAction({
        displayName: username,
        settings: { theme: 'night', buzzable: true },
      }),
    );
  } catch (e) {
    yield call(SwalCall, {
      title: 'Oops',
      text: 'Wrong username or password, or account does not exist.',
      icon: 'error',
    });
  }
}

export function* loginSuccess(): SagaIterator {
  yield call([socket, socket.reinitialize]);
}

export function* logout(): SagaIterator {
  yield call(socket.close);
  yield call(Cookie.remove, 'AUTH_TOKEN');
}

export function* watchSignup(): SagaIterator {
  yield takeLatest(SIGNUP, signup);
}

export function* watchLogin(): SagaIterator {
  yield takeLatest(LOGIN, login);
}

export function* watchLoginSuccess(): SagaIterator {
  yield takeLatest(LOGIN_SUCCESS, loginSuccess);
}

export function* watchLogout(): SagaIterator {
  yield takeLatest(LOGOUT, logout);
}

export function* authSaga(): SagaIterator {
  yield fork(watchSignup);
  yield fork(watchLogin);
  yield fork(watchLoginSuccess);
  yield fork(watchLogout);
}
