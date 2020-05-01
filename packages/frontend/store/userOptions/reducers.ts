import {
  SET_THEME,
  SET_BUZZABLE,
  IUserOptionsState,
  UserOptionsActionTypes,
} from './types';

const initialState: IUserOptionsState = {
  theme: {
    name: 'night',
  },
  buzzable: true,
};

const reducer = (
  state: IUserOptionsState = initialState,
  action: UserOptionsActionTypes,
): IUserOptionsState => {
  switch (action.type) {
    case SET_THEME:
      return {
        ...state,
        theme: {
          name: action.name,
        },
      };

    case SET_BUZZABLE:
      return {
        ...state,
        buzzable: action.buzzable,
      };

    default:
      return state;
  }
};

export default reducer;
