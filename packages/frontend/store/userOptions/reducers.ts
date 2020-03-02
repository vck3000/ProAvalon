import {
  SET_THEME,
  SET_BUZZABLE,
  IUserOptionsState,
  UserOptionsActionTypes,
} from './types';
import { NIGHT_COLORS, DAY_COLORS } from '../../components/colors';

const initialState: IUserOptionsState = {
  theme: {
    name: 'night',
    colors: NIGHT_COLORS,
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
