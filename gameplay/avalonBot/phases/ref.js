/* Each phase should have:
    - Name
    - Whether to show guns or not
    - GameMove to perform operations
    - Buttons that are visible and what text they have
    - Number of targets allowed to be selected
    - Status message to display
    - Prohibited Indexes to pick (an array)
*/

const usernamesIndexes = require("../../../myFunctions/usernamesIndexes");

function Ref(thisRoom_) {
    this.thisRoom = thisRoom_;

    this.phase = "ref";
    this.showGuns = false;

    this.card = "Ref of the Rain";
}

Ref.prototype.gameMove = function (socket, data) {
    if (socket === undefined || data === undefined) {
        return;
    }

    // console.log("typeof Data: ");
    // console.log(typeof(data));

    if (typeof (data) === "object" || typeof (data) === "array") {
        data = data[0];
    }

    // console.log("Data: ");
    // console.log(data);

    // Check that the target's username exists
    const targetUsername = data;
    let found = false;
    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
        if (this.thisRoom.playersInGame[i].username === targetUsername) {
            found = true;
            break;
        }
    }
    if (!found) {
        socket.emit("danger-alert", "Error: User does not exist. Tell the admin if you see this.");
        return;
    }

    const indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;
    const { refHistory } = this.thisRoom.specialCards[this.card.toLowerCase()];
    const targetIndex = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, data);

    // Get index of socket
    let indexOfSocket;
    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
    // console.log("Comparing: " + this.thisRoom.playersInGame[i].username + " with " + socket.request.user.username);
        if (this.thisRoom.playersInGame[i].username === socket.request.user.username) {
            indexOfSocket = i;
            break;
        }
    }

    // console.log("Index of socket: ");
    // console.log(indexOfSocket);

    // If the requester is the ref holder, do the ref stuff
    if (indexOfCardHolder === indexOfSocket) {
    // Check if we can card that person
        if (refHistory.includes(data)) {
            socket.emit("danger-alert", "You cannot card that person.");
            return;
        }

        // grab the target's alliance
        const { alliance } = this.thisRoom.playersInGame[targetIndex];

        // emit to the ref holder the person's alliance
        socket.emit("lady-info", /* "Player " + */`${targetUsername} is a ${alliance}.`);
        // console.log("Player " + target + " is a " + alliance);

        // update ref location
        this.thisRoom.specialCards[this.card.toLowerCase()].setHolder(targetIndex);

        // this.gameplayMessage = (socket.request.user.username + " has carded " + target);
        this.thisRoom.sendText(this.thisRoom.allSockets, (`${socket.request.user.username} has used ${this.card} on ${targetUsername}.`), "gameplay-text");


        // update phase
        this.thisRoom.phase = "pickingTeam";
    }
    // The requester is not the ref holder. Ignore the request.
    else {
        socket.emit("danger-alert", "You do not hold the card.");
    }
};

Ref.prototype.buttonSettings = function (indexOfPlayer) {
    // Get the index of the ref
    const indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;

    const obj = {
        green: {},
        red: {},
    };

    if (indexOfPlayer === indexOfCardHolder) {
        obj.green.hidden = false;
        obj.green.disabled = true;
        obj.green.setText = "Card";

        obj.red.hidden = true;
        obj.red.disabled = true;
        obj.red.setText = "";
    }
    // If it is any other player who isn't special role
    else {
        obj.green.hidden = true;
        obj.green.disabled = true;
        obj.green.setText = "";

        obj.red.hidden = true;
        obj.red.disabled = true;
        obj.red.setText = "";
    }
    return obj;
};

Ref.prototype.numOfTargets = function (indexOfPlayer) {
    const indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;

    if (indexOfPlayer !== undefined && indexOfPlayer !== null) {
    // If indexOfPlayer is the ref holder, one player to select
        if (indexOfPlayer === indexOfCardHolder) {
            return 1;
        }

        return null;
    }
};


Ref.prototype.getStatusMessage = function (indexOfPlayer) {
    const indexOfCardHolder = this.thisRoom.specialCards[this.card.toLowerCase()].indexOfPlayerHolding;

    if (indexOfPlayer === indexOfCardHolder) {
        return "Choose a player to use the Ref of the Rain on.";
    }
    // If it is any other player who isn't special role

    const usernameOfCardHolder = this.thisRoom.playersInGame[indexOfCardHolder].username;
    return `Waiting for ${usernameOfCardHolder} to use the Ref of the Rain on someone.`;
};

Ref.prototype.getProhibitedIndexesToPick = function (indexOfPlayer) {
    const { refHistory } = this.thisRoom.specialCards[this.card.toLowerCase()];

    return refHistory;
};


module.exports = Ref;
