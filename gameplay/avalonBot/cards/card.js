/** An abstract class for different cards in the game of Avalon. */
export default class Card {
    /**
     * Create a new card type.
     * @param {*} thisRoom
     * @param {*} specialPhase If there is a special phase attached to the role e.g. Lady of the Lake has lady
     * @param {*} name Name of Card (Note first letter is usually capitalised)
     */
    constructor(thisRoom, specialPhase, name) {
        this.thisRoom = thisRoom;
        this.specialPhase = specialPhase;
        this.card = name;
        this.indexOfPlayerHolding;
    }

    setHolder(socket, data) {
        // this.indexOfPlayerHolding = /* TODO: Complete this section */
    }

    /** Check if we need to go to a special phase. */
    checkSpecialMove(socket, data) {
    }

    /**
     * (Can delete this function. Not absolutely necessary)
     * Public data to show the user(s) e.g. who holds the lady of the lake
     */
    getPublicGameData() {
    }
}
