
function LadyOfTheLake(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.specialPhase = "lady";

	this.card = "Lady of the Lake";
	
	this.indexOfPlayerHolding;
	this.lastMissionUsed = 0;

	this.ladyHistory = []; // To be stored in the database later.

	this.ladyChain = []; // To be stored in the database later.
};

LadyOfTheLake.prototype.initialise = function(){
	this.setHolder((this.thisRoom.teamLeader + 1) % this.thisRoom.playersInGame.length);
};

LadyOfTheLake.prototype.setHolder = function(index){
	this.indexOfPlayerHolding = index;
	this.ladyHistory.push(index);
	this.ladyChain.push(this.thisRoom.playersInGame[index].role);
};

LadyOfTheLake.prototype.checkSpecialMove = function(socket, data){
	// Only use lady of the lake after m2, when the success/fail is revealed, but before the next mission starts.
	// Only once per mission.

	// First card starts at the start of M3
	if (this.thisRoom.missionHistory.length >= 3 && this.lastMissionUsed !== this.thisRoom.missionNum) {
		this.thisRoom.phase = "lady";
		this.lastMissionUsed = this.thisRoom.missionNum;

		return true;
	}
	else{
		return false;
	}
};

LadyOfTheLake.prototype.getPublicGameData = function(){
    /* TODO: (Can delete this function. Not absolutely necessary)
	Public data to show the user(s) e.g. who holds the lady of the lake */
	return {indexLadyHolder: this.indexOfPlayerHolding}
}


module.exports = LadyOfTheLake;