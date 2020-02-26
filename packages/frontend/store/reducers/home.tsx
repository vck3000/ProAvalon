import { HomeState, HomeActionTypes, HomeActions } from '../types/home';

const initialState: HomeState = {
  nightTheme: false,
};

const { CHANGE_THEME } = HomeActionTypes;

export const homeReducer = (
  state: HomeState = initialState,
  action: HomeActions
): HomeState => {
  switch(action.type) {
    case CHANGE_THEME:
      return {...state, nightTheme: !state.nightTheme};
    default:
      return state;
  }
}

export const anotherReducer = (
  state: HomeState = initialState,
  action: HomeActions
): HomeState => {
  switch(action.type) {
    case CHANGE_THEME:
      return {...state, nightTheme: !state.nightTheme};
    default:
      return state;
  }
}