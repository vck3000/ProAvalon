
class Morgana {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        this.role = 'Morgana';
        this.alliance = 'Spy';

        this.description = 'A spy who looks like Merlin to Percival.';
        this.orderPriorityInOptions = 70;
    }

    // Morgana sees all spies except oberon
    see() {
        if (this.thisRoom.gameStarted === true) {
            const obj = {};
            const array = [];

            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].alliance === 'Spy') {
                    if (this.thisRoom.playersInGame[i].role === 'Oberon') {
                        // don't add oberon
                    } else {
                        // add the spy
                        array.push(this.thisRoom.playersInGame[i].username);
                    }
                }
            }

            obj.spies = array;
            return obj;
        }
    }

    checkSpecialMove() {

    }
}


module.exports = Morgana;
