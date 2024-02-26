import { Alliance } from '../../types';
import Game from '../../game';
import { Phase } from '../../phases/types';
import { Role } from '../types';
import Assassin from './assassin';

class MordredAssassin extends Assassin {
  room: Game;

  static role = Role.MordredAssassin;
  role = Role.MordredAssassin;

  alliance = Alliance.Spy;
  specialPhase = Phase.Assassination;

  description =
    'If the resistance win 3 missions, the MordredAssassin can shoot one person for Merlin, or two people for Tristan and Isolde. If they are correct, the spies win!';
  orderPriorityInOptions = 90;

  constructor(room: Game) {
    super(room);
  }
}

export default MordredAssassin;
