

function LadyOfTheLake(thisRoom_) {

    this.thisRoom = thisRoom_;
	this.card = "Lady of the Lake";
	

    
    this.test = function(){
        // The following lines running successfully shows that each role file can access
        // the variables and functions from the game room!
        console.log("HII from Lady of the Lake. The number of sockets is: " + this.thisRoom.allSockets.length);
    }


}

LadyOfTheLake.prototype.checkSpecialMove = function(){

}



// setStatusBarText("Your turn to use the Lady of the Lake. Select one player to use it on.");



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