export const LOGIN = 'LOGIN';
export const SIGNUP = 'SIGNUP';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const SET_SETTING = 'SET_SETTING';

type Theme = 'night' | 'day';

interface IUserSettings {
  theme: Theme;
  buzzable: boolean;
}

export interface IUser {
  displayName: string;
  settings: IUserSettings;
}

export type UserState = IUser | null;

// Redux Saga actions
export interface ISignupAction {
  type: typeof SIGNUP;
  payload: {
    username: string;
    password: string;
    email: string;
  };
}

export interface ILoginAction {
  type: typeof LOGIN;
  payload: {
    username: string;
    password: string;
  };
}

export interface ILoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: IUser;
}

export interface ILogoutAction {
  type: typeof LOGOUT;
}

export interface ISetSettingAction<T extends keyof IUserSettings> {
  type: typeof SET_SETTING;
  payload: {
    setting: T;
    value: IUserSettings[T];
  };
}

export type UserActionTypes =
  | ISignupAction
  | ILoginAction
  | ILoginSuccessAction
  | ILogoutAction
  | ISetSettingAction<keyof IUserSettings>;
