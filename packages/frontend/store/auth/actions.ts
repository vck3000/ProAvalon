import { LOGIN, SIGNUP, ILoginAction, ISignupAction } from './action.types';

export const signup = (): ISignupAction => {
  return {
    type: SIGNUP,
  };
};

export const login = (): ILoginAction => {
  return {
    type: LOGIN,
  };
};
