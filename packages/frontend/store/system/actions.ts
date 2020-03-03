import {
  WindowProps,
  GET_WIDTH,
  IGetWidthAction
} from './types';

const getWindowWidth = (width: WindowProps['width']): IGetWidthAction => {
  return {
    type: GET_WIDTH,
    width,
  };
};

export default getWindowWidth;
