export const SET_MOBILE_VIEW = 'SET_MOBILE_VIEW';
export const SET_WINDOW_DIMENSIONS = 'SET_WINDOW_DIMENSIONS';

export type MobileView = boolean;
export type WindowDimensions = {
  width: number;
  height: number;
};

export interface ISetMobileViewAction {
  type: typeof SET_MOBILE_VIEW;
  mobileView: MobileView;
}

export interface ISetWindowDimensionsAction {
  type: typeof SET_WINDOW_DIMENSIONS;
  windowDimensions: WindowDimensions;
}

export interface ISystemState {
  mobileView: MobileView;
  windowDimensions: WindowDimensions;
}

export type SystemActionTypes =
  | ISetMobileViewAction
  | ISetWindowDimensionsAction;
