import { SagaIterator } from 'redux-saga';
import { call, takeLatest, fork, put } from 'redux-saga/effects';
import Cookie from 'js-cookie';
import Swal from 'sweetalert2';
import Router from 'next/router';

import { LOGIN, SIGNUP, ISignupAction, ILoginAction } from './action.types';
import { Post } from '../../axios';

import { login as loginAction } from './actions';

export function* signup(action: ISignupAction): SagaIterator {
  try {
    const res = yield call(Post, '/auth/signup', {
      username: action.username,
      password: action.password,
      email: action.email,
    });

    Swal.fire({
      heightAuto: false,
      title: 'Success!',
      text: res.data,
      icon: 'success',
    });

    // Login after a successful signup.
    yield put(
      loginAction({ username: action.username, password: action.password }),
    );
  } catch (e) {
    Swal.fire({
      heightAuto: false,
      title: 'Oops',
      text: e.response.data,
      icon: 'error',
    });
  }
}

export function* login(action: ILoginAction): SagaIterator {
  try {
    const response = yield call(Post, '/auth/login', {
      username: action.username,
      password: action.password,
    });

    // TODO: Maybe can remove this?
    yield call(Cookie.remove, 'AUTH_TOKEN');

    yield call(Cookie.set, 'AUTH_TOKEN', response.data.token, {
      // TODO: This is causing issues on local environments where it is http. Maybe make this an env var?
      // secure: true,
      expires: response.data.expires,
    });

    yield call(Router.push, '/lobby');
  } catch (e) {
    Swal.fire({
      heightAuto: false,
      title: 'Oops',
      text: 'Wrong username or password, or account does not exist.',
      icon: 'error',
    });
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
