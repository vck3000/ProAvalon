import { combineReducers } from "redux";
import { CustomAction, actionTypes } from './actions'
import { DAY_COLOURS, NIGHT_COLOURS, ColourTheme } from '../components/colours';

export interface State {
  theme: ColourTheme;
}

export interface ReducersState {
  reducer: State;
}

export const initialState = {
  theme: DAY_COLOURS
}

export const reducersState = {
  reducer: initialState
}

const reducer = (
  state: State = initialState,
  action: CustomAction
): State => {
  switch(action.type) {
    case actionTypes.CHANGE_THEME:
      return {...state, theme: state.theme.TYPE === 'day' ? NIGHT_COLOURS : DAY_COLOURS };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  reducer
});

export default rootReducer;
