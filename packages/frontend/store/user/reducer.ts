import {
  UserState,
  UserActionTypes,
  LOGIN_SUCCESS,
  LOGOUT,
  SET_SETTING,
} from './types';
import { RootState } from '..';

export const userSelector = (state: RootState): UserState => state.user;

const reducer = (
  state: UserState = null,
  action: UserActionTypes,
): UserState => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        displayName: action.payload.displayName,
        settings: action.payload.settings,
      };
    case LOGOUT:
      return null;
    case SET_SETTING:
      if (!state) return state;

      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.setting]: action.payload.value,
        },
      };
    default:
      return state;
  }
};

export default reducer;
