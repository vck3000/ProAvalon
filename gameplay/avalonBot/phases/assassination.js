/* Each phase must have:
- Name
- Whether to show guns or not
- GameMove to perform operations
- Buttons that are visible and what text they have
- Number of targets allowed to be selected
- Status message to display
*/
const usernamesIndexes = require('../../../myFunctions/usernamesIndexes');

class Assassination {
    constructor(thisRoom) {
        this.thisRoom = thisRoom;

        // The role that is the owner of this phase
        this.role = 'Assassin';

        this.phase = 'assassination';
        this.showGuns = true;

        this.finishedShot = false;
    }

    gameMove(socket, buttonPressed, selectedPlayers) {
        if (buttonPressed !== 'yes') {
            // this.thisRoom.sendText(this.thisRoom.allSockets, `Button pressed was ${buttonPressed}. Let admin know if you see this.`, "gameplay-text");
            return;
        }

        if (this.finishedShot === false) {
            // Carry out the assassination move
            if (socket && selectedPlayers) {
                // Check that the person making this request is the assassin
                const indexOfRequester = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, socket.request.user.username);
                if (this.thisRoom.playersInGame[indexOfRequester].role === this.role) {
                    // Just shoot Merlin
                    if (selectedPlayers.length === 1) {
                        if (typeof (selectedPlayers) === 'object' || typeof (selectedPlayers) === 'array') {
                            selectedPlayers = selectedPlayers[0];
                        }
                        
                        const indexOfTarget = this.thisRoom.playerUsernamesInGame.findIndex(username => username === selectedPlayers);
                        // Check the alliance of the target. If they are spy, reject it and ask them to shoot a res.
                        // Note: Allowed to shoot Oberon
                        if (this.thisRoom.playersInGame[indexOfTarget].alliance === 'Spy'
                        && this.thisRoom.playersInGame[indexOfTarget].role !== 'Oberon') {
                            socket.emit('danger-alert', 'You are not allowed to shoot a known spy.');
                            return;
                        }

                        // Get merlin's username
                        let merlinUsername;
                        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                            if (this.thisRoom.playersInGame[i].role === 'Merlin') {
                                merlinUsername = this.thisRoom.playerUsernamesInGame[i];
                            }
                        }

                        // set the player shot in the assassin role object
                        this.thisRoom.specialRoles.assassin.playerShot = selectedPlayers;

                        if (indexOfTarget !== -1) {
                            if (this.thisRoom.playersInGame[indexOfTarget].role === 'Merlin') {
                                this.thisRoom.winner = 'Spy';
                                this.thisRoom.howWasWon = 'Assassinated Merlin correctly.';

                                this.thisRoom.sendText(this.thisRoom.allSockets, `The assassin has shot ${merlinUsername}! They were correct!`, 'gameplay-text-red');
                            } else {
                                this.thisRoom.winner = 'Resistance';
                                this.thisRoom.howWasWon = 'Mission successes and assassin shot wrong.';

                                // console.log("THIS WAS RUN ONCE");
                                this.thisRoom.sendText(this.thisRoom.allSockets, `The assassin has shot ${selectedPlayers}! ${selectedPlayers} was not merlin, ${merlinUsername} was!`, 'gameplay-text-blue');
                            }

                            this.finishedShot = true;

                            // For gameRecord - get the role that was shot
                            for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
                                if (this.thisRoom.playerUsernamesInGame[i] === selectedPlayers) {
                                    this.thisRoom.whoAssassinShot = this.thisRoom.playersInGame[i].role;
                                    break;
                                }
                            }

                            this.thisRoom.finishGame(this.thisRoom.winner);
                        } else {
                            console.log(selectedPlayers);
                            socket.emit('danger-alert', 'Bad assassination data. Tell the admin if you see this!');
                        }
                    }

                    // Only shoot Tristan and Isolde together
                    else if (selectedPlayers.length === 2) {
                        const i0 = this.thisRoom.playerUsernamesInGame.findIndex(username => username === selectedPlayers[0]);
                        const i1 = this.thisRoom.playerUsernamesInGame.findIndex(username => username === selectedPlayers[1]);
                        // Check the alliance of the target. If they are spy, reject it and ask them to shoot a res.
                        // Note: Allowed to shoot Oberon
                        if (this.thisRoom.playersInGame[i0].alliance === 'Spy'
                        && this.thisRoom.playersInGame[i0].role !== 'Oberon') {
                            socket.emit('danger-alert', 'You are not allowed to shoot a known spy.');
                            return;
                        }

                        if (this.thisRoom.playersInGame[i1].alliance === 'Spy'
                        && this.thisRoom.playersInGame[i1].role !== 'Oberon') {
                            socket.emit('danger-alert', 'You are not allowed to shoot a known spy.');
                            return;
                        }

                        // Get tristan's username
                        // Get isolde's username
                        let tristanUsername = '';
                        let isoldeUsername = '';
                        for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
                            if (this.thisRoom.playersInGame[i].role === 'Tristan') {
                                tristanUsername = this.thisRoom.playerUsernamesInGame[i];
                            }
                            if (this.thisRoom.playersInGame[i].role === 'Isolde') {
                                isoldeUsername = this.thisRoom.playerUsernamesInGame[i];
                            }
                        }

                        // set the player shot in the assassin role object
                        this.thisRoom.specialRoles.assassin.playerShot = selectedPlayers[0];
                        this.thisRoom.specialRoles.assassin.playerShot2 = selectedPlayers[1];

                        const correctComboShot = false;
                        if (
                            (
                                this.thisRoom.playersInGame[i0].role === 'Tristan'
                                && this.thisRoom.playersInGame[i1].role === 'Isolde'
                            )
                            || (
                                this.thisRoom.playersInGame[i1].role === 'Tristan'
                                && this.thisRoom.playersInGame[i0].role === 'Isolde'
                            )
                        ) {
                            this.thisRoom.winner = 'Spy';
                            this.thisRoom.howWasWon = 'Assassinated Tristan and Isolde correctly.';

                            this.thisRoom.sendText(this.thisRoom.allSockets, `The assassin has shot ${tristanUsername} and ${isoldeUsername}! They were correct!`, 'gameplay-text-red');
                        } else {
                            this.thisRoom.winner = 'Resistance';
                            this.thisRoom.howWasWon = 'Mission successes and assassin shot wrong.';

                            // console.log("THIS WAS RUN ONCE");
                            this.thisRoom.sendText(this.thisRoom.allSockets, `The assassin has shot ${selectedPlayers[0]} and ${selectedPlayers[1]}! ${selectedPlayers[0]} and ${selectedPlayers[1]} were not Tristan and Isolde, ${tristanUsername} and ${isoldeUsername} were!`, 'gameplay-text-blue');
                        }

                        this.finishedShot = true;

                        // console.log("playersInGame");
                        // For gameRecord - get the role that was shot
                        for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
                            // console.log(this.thisRoom.playersInGame[i].username + " is " + this.thisRoom.playersInGame[i].role);
                            // console.log("data0: " + data[0]);
                            // console.log("data1: " + data[1]);
                            
                            if (this.thisRoom.playerUsernamesInGame[i] === selectedPlayers[0]) {
                                this.thisRoom.whoAssassinShot = this.thisRoom.playersInGame[i].role;
                            }
                            
                            if (this.thisRoom.playerUsernamesInGame[i] === selectedPlayers[1]) {
                                this.thisRoom.whoAssassinShot2 = this.thisRoom.playersInGame[i].role;
                            }
                        }

                        this.thisRoom.finishGame(this.thisRoom.winner);
                    }
                }
            }
        }
    }

    // Returns a object with green and red keys.
    // Green and Red must both have the following properties:
    //  hidden          - Is the button hidden?
    //  disabled        - Is the button disabled?
    //  setText         - What text to display in the button
    buttonSettings(indexOfPlayer) {
        // Get the index of the assassin
        let indexOfAssassin = -1;
        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === this.role) {
                indexOfAssassin = i;
                break;
            }
        }

        const obj = {
            green: {},
            red: {},
        };

        if (indexOfPlayer === indexOfAssassin) {
            obj.green.hidden = false;
            obj.green.disabled = true;
            obj.green.setText = 'Shoot';

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
        if (indexOfPlayer !== undefined && indexOfPlayer !== null) {
            // If assassin, one player to select (assassinate)
            if (this.thisRoom.playersInGame[indexOfPlayer].role === this.role) {
                // Check if Merlin exists.
                let merlinExists = false;
                // Check if iso tristan are both in the game.
                let tristExists = false;
                let isoExists = false;

                for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                    if (this.thisRoom.playersInGame[i].role === 'Merlin') {
                        merlinExists = true;
                    }

                    if (this.thisRoom.playersInGame[i].role === 'Tristan') {
                        tristExists = true;
                    }

                    if (this.thisRoom.playersInGame[i].role === 'Isolde') {
                        isoExists = true;
                    }
                }

                if (tristExists === true && isoExists === true && merlinExists) {
                    return [1, 2];
                } if (tristExists === true && isoExists === true) {
                    return 2;
                } if (merlinExists === true) {
                    return 1;
                }
            } else {
                return null;
            }
        }
    }


    getStatusMessage(indexOfPlayer) {
        // Get the index of the assassin
        let indexOfAssassin = -1;
        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === this.role) {
                indexOfAssassin = i;
            }
        }

        if (indexOfPlayer === indexOfAssassin) {
            return 'Choose someone to assassinate.';
        }
        // If it is any other player who isn't special role

        const usernameOfAssassin = this.thisRoom.playerUsernamesInGame[indexOfAssassin];
        return `Waiting for ${usernameOfAssassin} to assassinate.`;
    }

    getProhibitedIndexesToPick(indexOfPlayer) {
        const spyIndexes = [];

        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].alliance === 'Spy' && this.thisRoom.playersInGame[i].role !== 'Oberon') {
                spyIndexes.push(i);
            }
        }

        return spyIndexes;
    }
}


module.exports = Assassination;
