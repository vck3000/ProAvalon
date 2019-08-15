class Tristan {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        this.role = 'Tristan';
        this.alliance = 'Resistance';

        this.description = 'Tristan and Isolde both see each other.';
        this.orderPriorityInOptions = 50;
    }

    see() {
        const roleTag = {};

        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === 'Isolde') {
                roleTag[this.thisRoom.playersInGame[i].username] = {};
                roleTag[this.thisRoom.playersInGame[i].username].roleTag = 'Isolde';
            }
        }

        console.log(roleTag);

        return roleTag;
    }
}


module.exports = Tristan;
