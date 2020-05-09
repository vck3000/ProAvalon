import {
  LOGIN,
  SIGNUP,
  LOGOUT,
  ILoginAction,
  ISignupAction,
  LOGIN_SUCCESS,
  IUser,
  UserActionTypes,
  SET_SETTING,
  ISetSettingAction,
} from './types';

export const signup = (payload: ISignupAction['payload']): UserActionTypes => {
  return {
    type: SIGNUP,
    payload,
  };
};

export const login = (payload: ILoginAction['payload']): UserActionTypes => {
  return {
    type: LOGIN,
    payload,
  };
};

export const loginSuccess = (user: IUser): UserActionTypes => {
  return {
    type: LOGIN_SUCCESS,
    payload: user,
  };
};

export const logout = (): UserActionTypes => {
  return {
    type: LOGOUT,
  };
};

export const setSetting = <T extends keyof IUser['settings']>(
  payload: ISetSettingAction<T>['payload'],
): UserActionTypes => {
  return {
    type: SET_SETTING,
    payload,
  };
};
