import Cookies from 'js-cookie';

import {
  LOGIN_USER_ERROR,
  LOGIN_USER_SUCCESS,
  IAuthenticationState,
  AuthenticationActionTypes,
} from './types';

const initialState: IAuthenticationState = {
  user: {
    isAuthenticated: typeof Cookies.get('auth__flow__spa__loggedUserObj') !== 'undefined',
    loggedUserObj: Cookies.getJSON('auth__flow__spa__loggedUserObj'),
  },
  error: null,
};

const reducer = (
  state: IAuthenticationState = initialState,
  action: AuthenticationActionTypes,
): IAuthenticationState => {
  switch (action.type) {
    case LOGIN_USER_ERROR:
      return {
        ...state,
        error: action.error,
      }
    case LOGIN_USER_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          isAuthenticated: true,
          loggedUserObj: action.username,
        },
        error: null,
      }
    default:
      return state;
  }
};

export default reducer;
