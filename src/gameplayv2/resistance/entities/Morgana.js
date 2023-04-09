class Morgana extends Spy {

    constructor() {
        this.thisRoom = thisRoom;
        this.name = 'Morgana'
    }

    // Morgana sees all spies except oberon
    see(thisRoom) {
        // THis method is to decide each round who can Morgana see
        if (thisRoom.gameStarted === true) {
            const obj = {};
            const array = [];

            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (thisRoom.playersInGame[i].alliance === 'Spy') {
                    if (thisRoom.playersInGame[i].role === 'Oberon') {
                        // don't add oberon
                    } else {
                        // add the spy
                        array.push(thisRoom.playersInGame[i].username);
                    }
                }
            }

            obj.spies = array;
            return obj;
        }
    }

    checkSpecialMove() { }
}

export default Morgana;
