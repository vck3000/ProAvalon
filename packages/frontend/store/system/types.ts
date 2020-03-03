export const GET_WIDTH = 'GET_WIDTH';

export type WindowProps = {
  width: number;
};

export interface IGetWidthAction {
  type: typeof GET_WIDTH;
  width: WindowProps['width'];
};

export interface IWindowPropsState {
  windowProps: WindowProps;
}
