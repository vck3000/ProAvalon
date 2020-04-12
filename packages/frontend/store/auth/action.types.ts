export const LOGIN = 'LOGIN';
export const SIGNUP = 'SIGNUP';

export type User = {
  username: string;
  password: string;
  email?: string;
};

// Redux Saga actions
export interface ISignupAction {
  type: typeof SIGNUP;
}

export interface ILoginAction {
  type: typeof LOGIN;
}
