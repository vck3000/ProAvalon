import {
  GET_WIDTH,
  IWindowPropsState,
  IGetWidthAction
} from './types';

const initialState: IWindowPropsState = {
  windowProps: {
    width: 1200
  }
};

const reducer = (
  state: IWindowPropsState = initialState,
  action: IGetWidthAction,
): IWindowPropsState => {
  switch (action.type) {
    case GET_WIDTH:
      return {
        ...state,
        windowProps: {
          width: action.width
        }
      };

    default:
      return state;
  }
};

export default reducer;