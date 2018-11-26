
function ResChief(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.specialPhase = undefined;

    this.role = "Resistance Chief";
    this.alliance = "Resistance";

    this.playerShot = "";

    this.see = function(){
        /* TODO: What the role sees (e.g. Percival sees Merlin and Morgana as "Merlin?") */
    }
};


ResChief.prototype.checkSpecialMove = function(socket, data){
    /* TODO: Check if we need to go to a special phase */
};
ResChief.prototype.getPublicGameData = function(){
    /* TODO: (Can delete this function. Not absolutely necessary)
    Public data to show the user(s) e.g. assassin bullet */
}


module.exports = ResChief;