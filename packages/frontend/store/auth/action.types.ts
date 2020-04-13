export const LOGIN = 'LOGIN';
export const SIGNUP = 'SIGNUP';

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
