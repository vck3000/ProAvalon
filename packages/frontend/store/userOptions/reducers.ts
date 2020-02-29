import {
  SET_THEME,
  SET_BUZZABLE,
  UserOptionsState,
  UserOptionsActionTypes,
} from './types';
import { NIGHT_COLORS, DAY_COLORS } from '../../components/colors';

const initialState: UserOptionsState = {
  theme: {
    name: 'night',
    colors: NIGHT_COLORS,
  },
  buzzable: true,
};

const reducer = (
  state: UserOptionsState = initialState,
  action: UserOptionsActionTypes,
): UserOptionsState => {
  switch (action.type) {
    case SET_THEME:
      return {
        ...state,
        theme: {
          name: action.name,
          colors: action.name === 'day' ? DAY_COLORS : NIGHT_COLORS,
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
