import {
  LOGIN,
  SIGNUP,
  LOGOUT,
  ILoginAction,
  ISignupAction,
  ILogoutAction,
  ILoginSuccessAction,
  LOGIN_SUCCESS,
} from './action.types';

export const signup = (inputs: Omit<ISignupAction, 'type'>): ISignupAction => {
  return {
    type: SIGNUP,
    ...inputs,
  };
};

export const login = (inputs: Omit<ILoginAction, 'type'>): ILoginAction => {
  return {
    type: LOGIN,
    ...inputs,
  };
};

export const loginSuccess = (
  inputs: Omit<ILoginSuccessAction, 'type'>,
): ILoginSuccessAction => {
  return {
    type: LOGIN_SUCCESS,
    ...inputs,
  };
};

export const logout = (): ILogoutAction => {
  return {
    type: LOGOUT,
  };
};
