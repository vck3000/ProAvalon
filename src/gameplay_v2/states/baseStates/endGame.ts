import { State } from '../../gameTypes';
import { IState } from '../state';

export class EndGame implements IState {
  static state = State.EndGame;
  state = State.EndGame;
}