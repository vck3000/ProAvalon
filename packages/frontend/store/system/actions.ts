import {
  SET_MOBILE_VIEW,
  SET_WINDOW_DIMENSIONS,
  ISystemState,
  ISetMobileViewAction,
  ISetWindowDimensionsAction,
  WindowDimensions,
} from './types';

export const setMobileView = (
  mobileView: ISystemState['mobileView'],
): ISetMobileViewAction => {
  return {
    type: SET_MOBILE_VIEW,
    mobileView,
  };
};

export const setWindowDimensions = (
  width: WindowDimensions['width'],
  height: WindowDimensions['height'],
): ISetWindowDimensionsAction => {
  return {
    type: SET_WINDOW_DIMENSIONS,
    windowDimensions: { width, height },
  };
};
