import {
  SET_MOBILE_VIEW,
  ISystemState,
  SystemActionTypes
} from './types';

const initialState: ISystemState = {
  mobileView: false,
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

    default:
      return state;
  }
};

export default reducer;
