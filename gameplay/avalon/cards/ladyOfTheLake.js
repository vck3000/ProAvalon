
function LadyOfTheLake(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.specialPhase = "lady";

    this.card = "Lady of the Lake";
	this.indexOfPlayerHolding;
	
	this.lastMissionUsed = 0;
	this.ladyHistory = [];
};

LadyOfTheLake.prototype.setHolder = function(index){
	this.indexOfPlayerHolding = index;
	this.ladyHistory.push(index);
};

LadyOfTheLake.prototype.checkSpecialMove = function(socket, data){
	// Only use lady of the lake after m2, when the success/fail is revealed, but before the next mission starts.
	// Only once per mission.
	if (this.missionHistory.length >= 2 && this.lastMissionUsed !== this.thisRoom.missionNum) {
		this.phase = "lady";
		this.lastMissionUsed = this.thisRoom.missionNum;
	}
};

LadyOfTheLake.prototype.getPublicGameData = function(){
    /* TODO: (Can delete this function. Not absolutely necessary)
    Public data to show the user(s) e.g. who holds the lady of the lake */
}


module.exports = LadyOfTheLake;


		// if (options.lady === true) {
		// 	this.lady = (this.teamLeader + 1) % this.playersInGame.length;
		// 	this.ladyablePeople = [];
		// 	for (var i = 0; i < this.playersInGame.length; i++) {
		// 		this.ladyablePeople[i] = true;
		// 	}
		// 	this.ladyablePeople[this.lady] = false;
		// }


		// if(options.lady === true){
		// 	this.ladyChain[0] = this.playersInGame[this.lady].role;
		// }


		// 			//only lady of the lake after m1 and m2 have finished.
		// 	//This is still the old missionNum, so when missionNum here is 1, it is the end of m2
		// 	if (this.lady !== undefined && this.missionNum >= 2) {
		// 		this.phase = "lady";

		// 	}