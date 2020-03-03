import {
  SET_MOBILE_VIEW,
  ISystemState,
  ISetMobileViewAction
} from './types';

const setMobileView = (mobileView: ISystemState['mobileView']): ISetMobileViewAction => {
  return {
    type: SET_MOBILE_VIEW,
    mobileView,
  };
};

export default setMobileView;
