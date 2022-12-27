class Guinevere {
  static role = 'Guinevere';
  static alliance = 'Resistance';

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = 'Guinevere';
    this.alliance = 'Spy';

    this.description = 'A Resistance traitor who supports the Spies but cannot fail missions.';
    this.orderPriorityInOptions = 50;
  }

  // Guinevere only sees him/herself
  see() {
    if (this.thisRoom.gameStarted === true) {
      const obj = {};
      const array = [];

      for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
        if (this.thisRoom.playersInGame[i].role === 'Guinevere') {
          array.push(this.thisRoom.playersInGame[i].username);
          break;
        }
      }

      obj.spies = array;
      return obj;
    }
  }

  checkSpecialMove() {}
}

export default Guinevere;
