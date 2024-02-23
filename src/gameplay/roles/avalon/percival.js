import { Alliance } from '../../types';
import { Role } from '../types';

class Percival {
  static role = Role.Percival;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = Role.Percival;
    this.alliance = Alliance.Resistance;

    this.description = 'Knows the identity of Merlin and Morgana.';
    this.orderPriorityInOptions = 80;
  }

  // Percival sees Merlin and Morgana
  see() {
    const roleTag = {};

    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (
        this.thisRoom.playersInGame[i].role === Role.Merlin ||
        this.thisRoom.playersInGame[i].role === Role.Morgana
      ) {
        roleTag[this.thisRoom.playersInGame[i].username] = {};
        roleTag[this.thisRoom.playersInGame[i].username].roleTag = 'Merlin?';
      }
    }

    return roleTag;
  }
}

export default Percival;
