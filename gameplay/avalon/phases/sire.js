/* Each phase should have:
- Name
- Whether to show guns or not
- GameMove to perform operations
- Buttons that are visible and what text they have
- Number of targets allowed to be selected
- Status message to display
- Prohibited Indexes to pick (an array)
*/

const usernamesIndexes = require('../../../myFunctions/usernamesIndexes');

class Sire {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        this.phase = 'sire';
        this.showGuns = false;

        this.card = 'Sire of the Sea';
    }

    gameMove(socket, buttonPressed, selectedPlayers) {
        if (buttonPressed !== 'yes') {
            // this.thisRoom.sendText(this.thisRoom.allSockets, `Button pressed was ${buttonPressed}. Let admin know if you see this.`, "gameplay-text");
            return;
        }

        if (socket === undefined || selectedPlayers === undefined) {
            return;
        }

        // console.log("typeof Data: ");
        // console.log(typeof(data));

        if (typeof (selectedPlayers) === 'object' || typeof (selectedPlayers) === 'array') {
            selectedPlayers = selectedPlayers[0];
        }

        // console.log("Data: ");
        // console.log(data);

        // Check that the target's username exists
        const targetUsername = selectedPlayers;
        let found = false;
        for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].username === targetUsername) {
                found = true;
                break;
            }
        }
        if (found === false) {
            socket.emit('danger-alert', 'Error: User does not exist. Tell the admin if you see this.');
            return;
        }

        const indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;
        const { sireHistory } = this.thisRoom.specialCards[this.card.toLowerCase()];
        const targetIndex = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, selectedPlayers);

        // Get index of socket
        let indexOfSocket;
        for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
            // console.log("Comparing: " + this.thisRoom.playersInGame[i].username + " with " + socket.request.user.username);
            if (this.thisRoom.playersInGame[i].username === socket.request.user.username) {
                indexOfSocket = i;
                break;
            }
        }

        // console.log("Index of socket: ");
        // console.log(indexOfSocket);

        // If the requester is the sire holder, do the sire stuff
        if (indexOfCardHolder === indexOfSocket) {
            // Check if we can card that person
            if (sireHistory.includes(selectedPlayers) === true) {
                socket.emit('danger-alert', 'You cannot card that person.');
                return;
            }

            // grab the carders's alliance
            let alliance;
            for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].username === socket.request.user.username) {
                    alliance = this.thisRoom.playersInGame[i].alliance;
                }
            }

            let socketOfTarget;
            for (var i = 0; i < this.thisRoom.socketsOfPlayers.length; i++) {
                if (this.thisRoom.socketsOfPlayers[i].request.user.username === targetUsername) {
                    socketOfTarget = this.thisRoom.socketsOfPlayers[i];
                    break;
                }
            }
            if (socketOfTarget === undefined) {
                socket.emit('danger-alert', 'There was an error finding the target. Let the admin know if you see this.');
                return;
            }

            // emit to the sire holder the person's alliance
            // note that the display is the same as lady's display
            socketOfTarget.emit('lady-info', /* "Player " + */`${socket.request.user.username} is a ${alliance}.`);
            // console.log("Player " + target + " is a " + alliance);

            // update sire location
            this.thisRoom.specialCards[this.card.toLowerCase()].setHolder(targetIndex);

            // this.gameplayMessage = (socket.request.user.username + " has carded " + target);
            this.thisRoom.sendText(this.thisRoom.allSockets, (`${socket.request.user.username} has used ${this.card} on ${targetUsername}.`), 'gameplay-text');


            // update phase
            this.thisRoom.phase = 'pickingTeam';
        }
        // The requester is not the sire holder. Ignore the request.
        else {
            socket.emit('danger-alert', 'You do not hold the card.');
        }
    }

    buttonSettings(indexOfPlayer) {
        // Get the index of the sire
        const indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;

        const obj = {
            green: {},
            red: {},
        };

        if (indexOfPlayer === indexOfCardHolder) {
            obj.green.hidden = false;
            obj.green.disabled = true;
            obj.green.setText = 'Card';

            obj.red.hidden = true;
            obj.red.disabled = true;
            obj.red.setText = '';
        }
        // If it is any other player who isn't special role
        else {
            obj.green.hidden = true;
            obj.green.disabled = true;
            obj.green.setText = '';

            obj.red.hidden = true;
            obj.red.disabled = true;
            obj.red.setText = '';
        }
        return obj;
    }

    numOfTargets(indexOfPlayer) {
        const indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;

        if (indexOfPlayer !== undefined && indexOfPlayer !== null) {
            // If indexOfPlayer is the sire holder, one player to select
            if (indexOfPlayer === indexOfCardHolder) {
                return 1;
            }
            return null;
        }
    }


    getStatusMessage(indexOfPlayer) {
        const indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;

        if (indexOfPlayer === indexOfCardHolder) {
            return 'Choose a player to use the Sire of the Sea on.';
        }
        // If it is any other player who isn't special role

        const usernameOfCardHolder = this.thisRoom.playersInGame[indexOfCardHolder].username;
        return `Waiting for ${usernameOfCardHolder} to use the Sire of the Sea on someone.`;
    }

    getProhibitedIndexesToPick(indexOfPlayer) {
        const { sireHistory } = this.thisRoom.specialCards[this.card.toLowerCase()];

        return sireHistory;
    }
}


module.exports = Sire;
