import { Action } from "redux";

export interface CustomAction extends Action {
  type: string;
  payload?: any;
}

export const actionTypes = {
  CHANGE_THEME: 'CHANGE_THEME'
}

export function changeTheme(): CustomAction {
  return { type: actionTypes.CHANGE_THEME }
};
