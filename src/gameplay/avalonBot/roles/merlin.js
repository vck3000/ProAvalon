
class Merlin {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        this.role = 'Merlin';
        this.alliance = 'Resistance';

        this.description = 'Knows the identity of the spies.';
        this.orderPriorityInOptions = 100;

        this.test = function () {
            // The following lines running successfully shows that each role file can access
            // the variables and functions from the game room!
            console.log(`HII from merlin. The number of sockets is: ${this.thisRoom.allSockets.length}`);
        };
    }


    see() {
        if (this.thisRoom.gameStarted === true) {
            const obj = {};

            const array = [];

            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].alliance === 'Spy') {
                    if (this.thisRoom.playersInGame[i].role === 'Mordred') {
                        // don't add mordred for Merlin to see
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
        // Merlin has no special move

        // To be honest, Merlin seeing the spies can be considered a "Special Move"
        // If we were to put that into here, in the startGame() function in the game.js file
        // Run all the role special moves once, and here, forcefully change the
        // see variable of the merlin's data object which will be sent to him.
    }
}

module.exports = Merlin;
