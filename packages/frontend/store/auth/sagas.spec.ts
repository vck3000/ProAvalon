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
        expires: 1234, // seconds
      },
    };

    return expectSaga(login, {
      type: LOGIN,
      username: 'test_user',
      password: 'test_password',
    })
      .provide([[matchers.call.fn(Post), fakeRes]])
      .call(Cookie.set, 'AUTH_TOKEN', fakeRes.data.token, {
        expires: fakeRes.data.expires / 86400, // expires as a float of number of days
      })
      .run();
  });
});
