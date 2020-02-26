import { Action } from "redux";

export interface HomeState {
  nightTheme: boolean;
}

export enum HomeActionTypes {
  CHANGE_THEME = 'CHANGE_THEME'
}

export interface HomeActions extends Action {
  type: string;
  payload?: any;
}
