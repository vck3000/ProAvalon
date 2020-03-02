import {
  SET_THEME,
  ThemeOptions,
  ISetThemeAction,
  SET_BUZZABLE,
  BuzzableOptions,
  ISetBuzzableAction,
} from './types';

export const setTheme = (name: ThemeOptions['name']): ISetThemeAction => {
  return {
    type: SET_THEME,
    name,
  };
};

export const setBuzzable = (buzzable: BuzzableOptions): ISetBuzzableAction => {
  return {
    type: SET_BUZZABLE,
    buzzable,
  };
};
