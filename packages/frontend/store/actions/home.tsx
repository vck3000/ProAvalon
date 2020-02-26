import { HomeActionTypes, HomeActions } from '../types/home';

export const changeTheme = (): HomeActions => ({
  type: HomeActionTypes.CHANGE_THEME
});

export const anotherAction = (): HomeActions => ({
  type: 'asdf'
});

