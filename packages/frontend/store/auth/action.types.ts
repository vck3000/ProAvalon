export const LOGIN = 'LOGIN';
export const SIGNUP = 'SIGNUP';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';

// Redux Saga actions
export interface ISignupAction {
  type: typeof SIGNUP;
  username: string;
  password: string;
  email: string;
}

export interface ILoginAction {
  type: typeof LOGIN;
  username: string;
  password: string;
}

export interface ILoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  username: string;
}

export interface ILogoutAction {
  type: typeof LOGOUT;
}

export type AuthActionTypes = ILoginSuccessAction | ILogoutAction;
