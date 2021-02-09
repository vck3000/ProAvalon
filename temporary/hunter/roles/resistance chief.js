
class ResChief {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        this.specialPhase = undefined;

        this.role = 'Resistance Chief';
        this.alliance = 'Resistance';

        this.playerShot = '';

        this.see = function () {
            /* TODO: What the role sees (e.g. Percival sees Merlin and Morgana as "Merlin?") */
        };
    }

    checkSpecialMove(socket, buttonPressed, selectedPlayers) {
        /* TODO: Check if we need to go to a special phase */
    }

    getPublicGameData() {
        /* TODO: (Can delete this function. Not absolutely necessary)
        Public data to show the user(s) e.g. assassin bullet */
    }
}
module.exports = ResChief;
