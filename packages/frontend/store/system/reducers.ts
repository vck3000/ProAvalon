import {
  SET_MOBILE_VIEW,
  ISystemState,
  SystemActionTypes,
  SET_WINDOW_DIMENSIONS,
} from './types';

const initialState: ISystemState = {
  mobileView: false,
  windowDimensions: {
    width: 0,
    height: 0,
  },
};

const reducer = (
  state: ISystemState = initialState,
  action: SystemActionTypes,
): ISystemState => {
  switch (action.type) {
    case SET_MOBILE_VIEW:
      return {
        ...state,
        mobileView: action.mobileView,
      };
    case SET_WINDOW_DIMENSIONS:
      return {
        ...state,
        windowDimensions: action.windowDimensions,
      };
    default:
      return state;
  }
};

export default reducer;
