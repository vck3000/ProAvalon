export interface IColorTheme {
  BACKGROUND: string;
  TEXT: string;
  TEXT_GRAY: string;
  TEXT_GRAY_LIGHT: string;
  TEXT_RED: string;
  LIGHT: string;
  ALT_LIGHT: string;
  GOLD: string;
  GOLD_LIGHT: string;
  GOLD_HOVER: string;
  MISSION_BLUE: string;
  MISSION_RED: string;
  ANNOUNCE_GOLD_BACKGROUND: string;
  ANNOUNCE_GOLD_TEXT: string;
  SLIDE_GOLD_BACKGROUND: string;
}

export const DAY_COLORS: IColorTheme = {
  BACKGROUND: '#eaeae4',
  TEXT: 'black',
  TEXT_GRAY: '#bab9b6',
  TEXT_GRAY_LIGHT: '#7c818a',
  TEXT_RED: '#8f5543',
  LIGHT: '#deded8',
  ALT_LIGHT: '#e4e3da',
  GOLD: '#a37d18',
  GOLD_LIGHT: '#bfa751',
  GOLD_HOVER: '#8a6d20',
  MISSION_BLUE: '#3663a4',
  MISSION_RED: '#87504d',
  ANNOUNCE_GOLD_BACKGROUND: '#a37d18', // to be changed
  ANNOUNCE_GOLD_TEXT: '#bab07a',
  SLIDE_GOLD_BACKGROUND: '#483e20',
};

export const NIGHT_COLORS: IColorTheme = {
  BACKGROUND: '#1b1b1b',
  TEXT: '#eeeeee',
  TEXT_GRAY: '#4e4e44',
  TEXT_GRAY_LIGHT: '#7c8089',
  TEXT_RED: '#894e3e',
  LIGHT: '#212121',
  ALT_LIGHT: '#2f2e2a',
  GOLD: '#a37d18',
  GOLD_LIGHT: '#bda84f',
  GOLD_HOVER: '#8a6d20',
  MISSION_BLUE: '#3663a4',
  MISSION_RED: '#87504d',
  ANNOUNCE_GOLD_BACKGROUND: '#a37d18',
  ANNOUNCE_GOLD_TEXT: '#bab07a',
  SLIDE_GOLD_BACKGROUND: '#483e20',
};
