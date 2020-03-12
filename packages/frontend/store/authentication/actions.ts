import {
  LOGIN_USER,
  ILoginUserAction,
  LoginDetails,
} from './types';

const loginUser = (loginDetails: LoginDetails): ILoginUserAction => {
  return {
    type: LOGIN_USER,
    loginDetails
  }
};

export default loginUser;
