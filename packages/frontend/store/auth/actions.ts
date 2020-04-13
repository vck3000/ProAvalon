import { LOGIN, SIGNUP, ILoginAction, ISignupAction } from './action.types';

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
