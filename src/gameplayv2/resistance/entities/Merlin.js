class Merlin extends Resistance {

    constructor() {
        // Not know why player js class has nextID variable, so not know how to use it
        this.name = 'Merlin'
    }
    // Now code of room not finished yet so need wait main class to complete first then I can change code below
    see(thisRoom) {
        // This function is to return what spy merlin can see
        if (thisRoom.gameStarted === true) {
            const obj = {};

            const array = [];

            for (let i = 0; i < thisRoom.playersInGame.length; i++) {
                if (thisRoom.playersInGame[i].alliance === 'Spy') {
                    if (thisRoom.playersInGame[i].role === 'Mordred') {
                        // don't add mordred for Merlin to see
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
}
export default Merlin;