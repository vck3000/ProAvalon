class Galahad {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        this.role = 'Galahad';
        this.alliance = 'Resistance';

        this.description = 'Learns the role of 1 other resistance member after 2 fails.  Sees himself as a regular resistance member until the 2nd fail.';
        this.orderPriorityInOptions = 40;
        
        this.resRevealUsername = undefined;

    }  
    see() {
        const roleTag = {};

        // If we have a res revealed, show them as Resistance.
        if (this.resRevealUsername !== undefined) {
            // Reveal Galahad role.
            this.thisRoom.playersInGame.filter(player => player.role === "Galahad")[0].displayRole = this.role;

            roleTag[this.resRevealUsername] = {};
            roleTag[this.resRevealUsername].roleTag = 'Resistance';
            console.log(roleTag);
            return roleTag;
        } 

        else {
            // Don't reveal Galahad role yet.
            this.thisRoom.playersInGame.filter(player => player.role === "Galahad")[0].displayRole = "Resistance";
        }
    }

    checkSpecialMove() {
        if (this.resRevealUsername === undefined) {
            // If we have two fails, then find a res to reveal. 
            var fails = this.thisRoom.missionHistory.filter(outcome => outcome === 'failed').length;
            if (fails == 2) {
                // Get the resistance players who aren't Galahad
                var resistancePlayers = this.thisRoom.playersInGame.filter(
                    player => player.alliance === "Resistance" && player.role !== "Galahad"
                );

                // Pick a random non-galahad resistance
                var randNum = Math.floor(Math.random() * resistancePlayers.length);
                this.resRevealUsername = resistancePlayers[randNum].username;

                // Assign the new see
                this.thisRoom.playersInGame.filter(player => player.role === "Galahad")[0].see = this.see();

                var message = `Galahad's special ability has activated.`;
                this.thisRoom.sendText(this.thisRoom.allSockets, message, 'server-text-teal');
            }
        }
    }
}
module.exports = Galahad;