// room object

// Get all the gamemodes and their roles/cards/phases.
const gameModeNames = [];
const fs = require('fs');

fs.readdirSync('./gameplay/').filter((file) => {
    if (fs.statSync(`${'./gameplay' + '/'}${file}`).isDirectory() === true && file !== 'commonPhases') {
        gameModeNames.push(file);
    }
});
// console.log(gameModeNames);
const gameModeObj = {};
for (let i = 0; i < gameModeNames.length; i++) {
    gameModeObj[gameModeNames[i]] = {};

    gameModeObj[gameModeNames[i]].Roles = require(`./${gameModeNames[i]}/indexRoles`);
    gameModeObj[gameModeNames[i]].Phases = require(`./${gameModeNames[i]}/indexPhases`);
    gameModeObj[gameModeNames[i]].Cards = require(`./${gameModeNames[i]}/indexCards`);
}

const commonPhasesIndex = require('./indexCommonPhases');


function Room(host_, roomId_, io_, maxNumPlayers_, newRoomPassword_, gameMode_, ranked_) {
    const thisRoom = this;

    if (newRoomPassword_ === '') {
        newRoomPassword_ = undefined;
    }

    if (maxNumPlayers_ === '' || maxNumPlayers_ < 5 || maxNumPlayers_ > 10) {
        maxNumPlayers_ = 10;
    }

    // Object input variables
    this.host = host_;
    this.roomId = roomId_;
    this.io = io_;
    this.maxNumPlayers = maxNumPlayers_;
    this.joinPassword = newRoomPassword_;
    this.gameMode = gameMode_;
    // Default value of avalon.
    if (gameModeNames.includes(this.gameMode) === false) {
        this.gameMode = 'avalon';
    }
    this.ranked = ranked_;
    this.gamesRequiredForRanked = 5;
    this.provisionalGamesRequired = 20;

    // Misc. variables
    this.canJoin = true;
    this.gamePlayerLeftDuringReady = false;

    // Sockets
    this.allSockets = [];
    this.socketsOfPlayers = [];

    // Arrays containing lower cased usernames
    this.kickedPlayers = [];
    this.claimingPlayers = [];


    // Phases Cards and Roles to use
    this.commonPhases = (new commonPhasesIndex()).getPhases(thisRoom);
    this.specialRoles = (new gameModeObj[this.gameMode].Roles()).getRoles(thisRoom);
    this.specialPhases = (new gameModeObj[this.gameMode].Phases()).getPhases(thisRoom);
    this.specialCards = (new gameModeObj[this.gameMode].Cards()).getCards(thisRoom);

    // timeout object for game closing
    this.destroyTimeoutObj;
}


Room.prototype.playerJoinRoom = function (socket, inputPassword) {
    console.log(`${socket.request.user.username} has joined room ${this.roomId}`);

    // check if the player is a moderator or an admin, if so bypass
    if (!(socket.isModSocket || socket.isAdminSocket)) {
        // if the room has a password and user hasn't put one in yet
        if (this.joinPassword !== undefined && inputPassword === undefined && (socket.isBotSocket === undefined || socket.isBotSocket === false)) {
            socket.emit('joinPassword', this.roomId);
            // console.log("No password inputted!");

            return false;
        }
        // if the room has a password and user HAS put a password in
        if (this.joinPassword !== undefined && inputPassword !== undefined && (socket.isBotSocket === undefined || socket.isBotSocket === false)) {
            if (this.joinPassword === inputPassword) {
                // console.log("Correct password!");

                socket.emit('correctRoomPassword');
                // continue on
            } else {
                // console.log("Wrong password!");

                // socket.emit("danger-alert", "The password you have inputted is incorrect.");
                socket.emit('wrongRoomPassword');
                socket.emit('changeView', 'lobby');
                return false;
            }
        }
    }


    this.allSockets.push(socket);

    this.updateRoomPlayers();

    this.sendOutGameModesInRoomToSocket(socket);

    // If a player joins the game while empty ensure that the destruction process is aborted
    if (this.destroyRoom) {
        this.destroyRoom = false;
        clearTimeout(this.destroyTimeoutObj);
        console.log(`Player joined empty room ${this.roomId}, destruction aborted.`)
    }

    return true;
};


Room.prototype.playerSitDown = function (socket) {
    socketUsername = socket.request.user.username;

    if (socketUsername === this.host && this.gameMode.toLowerCase().includes('bot') === true) {
        data = {
            message: 'Type /help to see the commands available to interact with bots!',
            classStr: 'server-text',
            dateCreated: new Date(),
        };
        socket.emit('roomChatToClient', data);
    }

    // If they were kicked and banned
    if (this.kickedPlayers.indexOf(socketUsername.toLowerCase()) !== -1) {
        socket.emit('danger-alert', 'The host has kicked you from this room. You cannot join.');
        return;
    }
    // If there are too many players already sitting down
    if (this.socketsOfPlayers.length >= this.maxNumPlayers) {
        socket.emit('danger-alert', 'The game has reached the limit for number of players.');
        return;
    }
    // If the room is ranked and the player doesn't have enough games to sit.
    if (this.ranked && socket.request.user.totalGamesPlayed < this.gamesRequiredForRanked) {
        socket.emit('danger-alert', `You do not have the required experience to sit in ranked games. Please play ${this.gamesRequiredForRanked} unranked games first.`);
        return;
    }
    // If they already exist, no need to add
    if (this.socketsOfPlayers.indexOf(socket) !== -1) {
        return;
    }

    // If the socket passes all the tests, then push them
    this.socketsOfPlayers.push(socket);

    this.updateRoomPlayers();
};


Room.prototype.playerStandUp = function (socket) {
    // Grab their index
    const index = this.socketsOfPlayers.indexOf(socket);
    // If they are on the list of sockets of players,
    if (index !== -1) {
        this.socketsOfPlayers.splice(index, 1);
        this.updateRoomPlayers();
    }
};


Room.prototype.playerLeaveRoom = function (socket) {
    // When a player leaves during ready, not ready phase
    if (this.socketsOfPlayers.indexOf(socket) !== -1) {
        this.gamePlayerLeftDuringReady = true;
    }

    // In case they were sitting down, remove them
    this.playerStandUp(socket);

    // Remove them from all sockets
    const index = this.allSockets.indexOf(socket);
    if (index !== -1) {
        this.allSockets.splice(index, 1);
    }


    let newHostSocket;
    // Set the host to the first person in the sitting down array in case the previous host left
    if (this.socketsOfPlayers[0] !== undefined && this.gameStarted === false) {
        newHostSocket = this.socketsOfPlayers[0];
        const oldHost = this.host;
        this.host = this.socketsOfPlayers[0].request.user.username;

        if (this.gameMode.toLowerCase().includes('bot') === true && oldHost !== this.host) {
            data = {
                message: 'Type /help to see the commands available to interact with bots!',
                classStr: 'server-text',
                dateCreated: new Date(),
            };
            newHostSocket.emit('roomChatToClient', data);
        }

        console.log(`new host: ${this.host}`);
    }

    // Destroy room if there's no one in it anymore
    if (this.allSockets.length === 0 && this.frozen !== true) {
        console.log(`Room: ${this.roomId} is empty, attempting to destroy...`);
        this.destroyRoom = true;
    }

    this.updateRoomPlayers();

    // If the new host is a bot... leave the room.
    if (newHostSocket !== undefined && newHostSocket.isBotSocket === true) {
        this.playerLeaveRoom(newHostSocket);
    }
};


Room.prototype.kickPlayer = function (username, socket) {
    if (this.host === socket.request.user.username) {
        // Get the socket of the target
        socketOfTarget = null;
        for (let i = 0; i < this.allSockets.length; i++) {
            if (username === this.allSockets[i].request.user.username) {
                socketOfTarget = this.allSockets[i];
            }
        }
        if (socketOfTarget === null) {
            return;
        }

        // Make them stand up forcefully
        this.playerStandUp(socketOfTarget);

        if (socketOfTarget.isBotSocket) {
            this.playerLeaveRoom(socketOfTarget);
        }


        // Add to kickedPlayers array
        this.kickedPlayers.push(username.toLowerCase());
        const kickMsg = `Player ${username} has been kicked by ${this.host}.`;
        this.sendText(this.socketsOfPlayers, kickMsg, 'server-text');
        // console.log(kickMsg);
        this.updateRoomPlayers();
    }
};

Room.prototype.setClaim = function (socket, data) {
    // data presents whether they want to CLAIM (true) or UNCLAIM (false)

    username = socket.request.user.username;

    index = this.claimingPlayers.indexOf(username);

    // If they want to claim and also don't exist on the claimingPlayers array
    if (data === true && index === -1) {
        this.claimingPlayers.push(username);
    }
    // If they want to unclaim and also do exist on the claimingPlayers array
    else if (data === false) {
        this.claimingPlayers.splice(index, 1);
    }

    this.updateRoomPlayers();
};


// Note this sends text to ALL players and ALL spectators
Room.prototype.sendText = function (sockets, incString, stringType) {
    data = {
        message: incString,
        classStr: stringType,
        dateCreated: new Date(),
    };
    for (let i = 0; i < this.allSockets.length; i++) {
        const tmpSocket = this.allSockets[i];
        if (tmpSocket && typeof (tmpSocket) !== 'undefined') {
            tmpSocket.emit('roomChatToClient', data);
        }
    }

    if (this.gameStarted && this.gameStarted === true) {
        this.addToChatHistory(data);
    }
};

Room.prototype.updateRoomPlayers = function () {
    // Get the usernames of spectators
    const usernamesOfSpecs = [];
    const socketsOfSpectators = this.getSocketsOfSpectators();
    socketsOfSpectators.forEach((sock) => {
        const dispUsername = sock.request.displayUsername ? sock.request.displayUsername : sock.request.user.username;
        usernamesOfSpecs.push(dispUsername);
    });
    // Sort the usernames
    usernamesOfSpecs.sort((a, b) => {
        const textA = a.toUpperCase();
        const textB = b.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });

    // Send the data to all sockets within the room.
    for (let i = 0; i < this.allSockets.length; i++) {
        const tmpSocket = this.allSockets[i];
        if (tmpSocket && typeof tmpSocket !== 'undefined') {
            tmpSocket.emit('update-room-players', this.getRoomPlayers());
            tmpSocket.emit('update-room-spectators', usernamesOfSpecs);
            tmpSocket.emit('update-room-info', { maxNumPlayers: this.maxNumPlayers });
        }
    }
};


Room.prototype.getRoomPlayers = function () {
    const roomPlayers = [];

    for (let i = 0; i < this.socketsOfPlayers.length; i++) {
        var isClaiming;
        // If the player's username exists on the list of claiming:
        if (this.claimingPlayers.indexOf(this.socketsOfPlayers[i].request.user.username) !== -1) {
            isClaiming = true;
        } else {
            isClaiming = false;
        }


        roomPlayers[i] = {
            username: this.socketsOfPlayers[i].request.user.username,
            avatarImgRes: this.socketsOfPlayers[i].request.user.avatarImgRes,
            avatarImgSpy: this.socketsOfPlayers[i].request.user.avatarImgSpy,
            avatarHide: this.socketsOfPlayers[i].request.user.avatarHide,
            claim: isClaiming,
        };

        // give the host the teamLeader star
        if (roomPlayers[i].username === this.host) {
            roomPlayers[i].teamLeader = true;
        }
    }

    return roomPlayers;
};

Room.prototype.getSocketsOfSpectators = function () {
    // slice to create a new complete copy of allSOckets
    const socketsOfSpecs = this.allSockets.slice();

    // If there is a socket that is sitting down within the socketsOfSpecs (which was at first a clone of allSockets)
    // then remove that socket. Do this for all socketsOfPlayers
    for (let i = 0; i < this.socketsOfPlayers.length; i++) {
        const index = socketsOfSpecs.indexOf(this.socketsOfPlayers[i]);
        if (index !== -1) {
            socketsOfSpecs.splice(index, 1);
        }
    }

    return socketsOfSpecs;
};

Room.prototype.updateMaxNumPlayers = function (socket, number) {
    if (socket.request.user.username === this.host && number >= 5 && number <= 10) {
        this.maxNumPlayers = number;
        this.updateRoomPlayers();
    }
};

Room.prototype.updateRanked = function (socket, rankedType) {
    if (this.joinPassword && rankedType === 'ranked') {
        this.sendText(this.allSockets, 'This room is private and therefore cannot be ranked.', 'server-text');
        return;
    }
    
    if (socket.request.user.username === this.host) {
        this.ranked = rankedType === 'ranked';
    }
    const rankedChangeMsg = `This room is now ${rankedType}.`
    this.sendText(this.allSockets, rankedChangeMsg, 'server-text');
}

Room.prototype.updateGameModesInRoom = function (socket, gameMode) {
    if (gameModeNames.includes(gameMode) === true && socket.request.user.username === this.host) {
        // If the new gameMode doesnt include bot, but originally does, then remove the bots that may have been added
        if (gameMode.toLowerCase().includes('bot') == false && this.botSockets !== undefined && this.botSockets.length > 0) {
            var thisRoom = this;

            const botSockets = this.botSockets.slice() || [];
            botsToRemove = botSockets;
            botsToRemove.forEach((botSocket) => {
                thisRoom.playerLeaveRoom(botSocket);

                if (thisRoom.botSockets && thisRoom.botSockets.indexOf(botSocket) !== -1) {
                    thisRoom.botSockets.splice(thisRoom.botSockets.indexOf(botSocket), 1);
                }
            });
            const removedBots = botsToRemove.map((botSocket) => botSocket.request.user.username);

            if (removedBots.length > 0) {
                const message = `${socket.request.user.username} removed bots from this room: ${removedBots.join(', ')}`;
                const classStr = 'server-text-teal';
                this.sendText(this.socketsOfPlayers, message, classStr);
            }
        }

        if (gameMode.toLowerCase().includes('bot') === true) {
            // Get host socket
            hostSock = this.socketsOfPlayers[0];
            data = {
                message: 'Type /help to see the commands available to interact with bots!',
                classStr: 'server-text',
                dateCreated: new Date(),
            };
            hostSock.emit('roomChatToClient', data);
        }

        this.gameMode = gameMode;
        var thisRoom = this;

        this.specialRoles = (new gameModeObj[this.gameMode].Roles()).getRoles(this);
        this.specialPhases = (new gameModeObj[this.gameMode].Phases()).getPhases(this);
        this.specialCards = (new gameModeObj[this.gameMode].Cards()).getCards(this);

        // Send the data to all sockets within the room.
        for (let i = 0; i < this.allSockets.length; i++) {
            if (this.allSockets[i]) {
                this.sendOutGameModesInRoomToSocket(this.allSockets[i]);
            }
        }
    } else {
        socket.emit('danger-alert', 'Eror happened when changing Game Mode. Let the admin know if you see this.');
    }
};

Room.prototype.sendOutGameModesInRoomToSocket = function (targetSocket) {
    // Get the names and descriptions of roles and cards to send to players
    const roleNames = [];
    const roleDescriptions = [];
    const roleAlliances = [];
    const rolePriorities = [];
    const cardNames = [];
    const cardDescriptions = [];
    const cardPriorities = [];

    const skipRoles = ['Resistance', 'Spy'];

    for (var key in this.specialRoles) {
        if (this.specialRoles.hasOwnProperty(key) === true) {
            // Skip Resistance and Spy since they are default roles always enabled.
            if (skipRoles.includes(this.specialRoles[key].role) === true) {
                continue;
            }

            roleNames.push(this.specialRoles[key].role);
            roleDescriptions.push(this.specialRoles[key].description);
            roleAlliances.push(this.specialRoles[key].alliance);
            if (!this.specialRoles[key].orderPriorityInOptions) {
                rolePriorities.push(0);
            } else {
                rolePriorities.push(this.specialRoles[key].orderPriorityInOptions);
            }
        }
    }

    for (var key in this.specialCards) {
        if (this.specialCards.hasOwnProperty(key) === true) {
            cardNames.push(this.specialCards[key].card);
            cardDescriptions.push(this.specialCards[key].description);
            if (!this.specialCards[key].orderPriorityInOptions) {
                cardPriorities.push(0);
            } else {
                cardPriorities.push(this.specialCards[key].orderPriorityInOptions);
            }
        }
    }

    const obj = {
        // Todo: Send over the roles/cards in the gamemode. Upon changing gamemode, resend.
        gameModes: gameModeNames,
        roles: {
            roleNames,
            alliances: roleAlliances,
            descriptions: roleDescriptions,
            orderPriorities: rolePriorities,
        },
        cards: {
            cardNames,
            descriptions: cardDescriptions,
            orderPriorities: cardPriorities,
        },
    };

    // Send the data to the socket.
    targetSocket.emit('update-game-modes-in-room', obj);
};


function getIndexFromUsername(sockets, username) {
    for (let i = 0; i < sockets.length; i++) {
        if (username === sockets[i].request.user.username) {
            return i;
        }
    }
}

function getUsernameFromIndex(usernames, index) {
    return usernames[index].username;
}


module.exports = Room;
