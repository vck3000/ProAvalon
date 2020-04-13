import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import Cookie from 'js-cookie';
import { login } from './sagas';
import { LOGIN } from './action.types';
import { Post } from '../../axios';

describe('AuthSaga', () => {
  it('should set token into cookies on successful login', () => {
    const fakeRes = {
      data: {
        token: '123abc',
      },
    };

    return expectSaga(login, {
      type: LOGIN,
      username: 'test_user',
      password: 'test_password',
    })
      .provide([[matchers.call.fn(Post), fakeRes]])
      .call(Cookie.set, 'AUTH_TOKEN', `${fakeRes.data.token}`)
      .run();
  });
});
