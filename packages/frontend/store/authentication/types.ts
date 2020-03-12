export const REGISTER_USER = 'REGISTER_USER';
export const REGISTER_USER_SUCCESS = 'REGISTER_USER_SUCCESS';
export const REGISTER_USER_ERROR = 'REGISTER_USER_ERROR';

export const LOGIN_USER = 'LOGIN_USER';
export const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';
export const LOGIN_USER_ERROR = 'LOGIN_USER_ERROR';

export type LoginDetails = {
  username: string;
  password: string;
};

export type RegisterDetails = LoginDetails;

export type User = {
  isAuthenticated: boolean;
  loggedUserObj: string;
}

export interface ILoginUserAction {
  type: typeof LOGIN_USER;
  loginDetails: LoginDetails;
};

export interface ILoginUserSuccess {
  type: typeof LOGIN_USER_SUCCESS;
  username: string;
}

export interface ILoginUserError {
  type: typeof LOGIN_USER_ERROR;
  error: Error;
}

export interface IAuthenticationState {
  user: User;
  error: Error | null;
};

export type AuthenticationActionTypes = ILoginUserAction
  | ILoginUserError
  | ILoginUserSuccess;
