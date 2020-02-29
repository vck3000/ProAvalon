import {
  SET_THEME,
  ThemeOptions,
  SetThemeAction,
  SET_BUZZABLE,
  BuzzableOptions,
  SetBuzzableAction,
} from './types';

export const setTheme = (name: ThemeOptions['name']): SetThemeAction => {
  return {
    type: SET_THEME,
    name,
  };
};

export const setBuzzable = (buzzable: BuzzableOptions): SetBuzzableAction => {
  return {
    type: SET_BUZZABLE,
    buzzable,
  };
};
