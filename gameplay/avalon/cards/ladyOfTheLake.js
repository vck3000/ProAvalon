





		if (options.lady === true) {
			this.lady = (this.teamLeader + 1) % this.playersInGame.length;
			this.ladyablePeople = [];
			for (var i = 0; i < this.playersInGame.length; i++) {
				this.ladyablePeople[i] = true;
			}
			this.ladyablePeople[this.lady] = false;
		}


		if(options.lady === true){
			this.ladyChain[0] = this.playersInGame[this.lady].role;
		}