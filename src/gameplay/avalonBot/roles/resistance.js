class Resistance {
  static role = 'Resistance';
  static alliance = 'Resistance';

  constructor(thisRoom) {
    this.thisRoom = thisRoom;

    this.role = 'Resistance';
    this.alliance = 'Resistance';

    this.description = 'A standard Resistance member.';
  }

  see() {
    return undefined;
  }

  checkSpecialMove() {}
}

export default Resistance;
