import { ColorTheme } from '../../components/colors';

// Determines the theme to display.
export const SET_THEME = 'SET_THEME';
// Theme options is an object with the name of the theme, and a bunch of colours
export type ThemeOptions = {
  name: 'day' | 'night';
  colors: ColorTheme;
};
// This is the action that will set a new theme. We only require 'day' or 'night'
export interface SetThemeAction {
  type: typeof SET_THEME;
  name: ThemeOptions['name'];
}

// Determines whether the client user is buzzable or not.
export const SET_BUZZABLE = 'SET_BUZZABLE';
export type BuzzableOptions = boolean;

export interface SetBuzzableAction {
  type: typeof SET_BUZZABLE;
  buzzable: BuzzableOptions;
}

// Add other user options here

export interface UserOptionsState {
  theme: ThemeOptions;
  buzzable: BuzzableOptions;
}

export type UserOptionsActionTypes = SetThemeAction | SetBuzzableAction;
