import { Alliance } from '../../types';

class Percival {
  static role = 'Percival';
  static alliance = Alliance.Resistance;

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = 'Percival';
    this.alliance = Alliance.Resistance;

    this.description = 'Knows the identity of Merlin and Morgana.';
    this.orderPriorityInOptions = 80;
  }

  // Percival sees Merlin and Morgana
  see() {
    const roleTag = {};

    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (
        this.thisRoom.playersInGame[i].role === 'Merlin' ||
        this.thisRoom.playersInGame[i].role === 'Morgana'
      ) {
        roleTag[this.thisRoom.playersInGame[i].username] = {};
        roleTag[this.thisRoom.playersInGame[i].username].roleTag = 'Merlin?';
      }
    }

    return roleTag;
  }
}

export default Percival;
