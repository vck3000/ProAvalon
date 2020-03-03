export const SET_MOBILE_VIEW = 'SET_MOBILE_VIEW';

export type MobileView = boolean;

export interface ISetMobileViewAction {
  type: typeof SET_MOBILE_VIEW;
  mobileView: MobileView;
}

export interface ISystemState {
  mobileView: MobileView;
}

export type SystemActionTypes = ISetMobileViewAction;
