const fs = require('fs');
const JSON = require('circular-json');

const gameRoom = require('../gameplay/game');

const savedGameObj = require('../models/savedGame');
const modAction = require('../models/modAction');
const User = require('../models/user');
const avatarRequest = require('../models/avatarRequest');

const GetRewards = require('../rewards/getRewards');
const REWARDS = require('../rewards/constants');

const getRewardsObj = new GetRewards();

const modsArray = require('../modsadmins/mods');
const adminsArray = require('../modsadmins/admins');

const { userCommands, modCommands, adminCommands } = require('./commands');

const {
    sendToAllChat, sendToRoomChat, socketCallback, getIndexFromUsername, getPlayerUsernamesFromAllSockets
} = require('./util');

const TEXT_LENGTH_LIMIT = 500;
const DATE_RESET_REQUIRED = 1543480412695;
const NEW_UPDATE_NOTIFICATION_REQUIRED = 1565505539914;
const updateMessage = `

<h1>Patreon Rewards!</h1>

<br>

Check out the forums for more information on how to connect your Patreon account :).
`;

const globalState = {
    allSockets: [],
    rooms: [],
    allChatHistory: [],
    allChat5Min: [],
    nextRoomId: 1,
    lastWhisperObj: {},
    io: {},
    currentModAtions: [],
};

// Get all the possible gameModes and add their names
const gameModeNames = require('../gameplay/gameModeNames');

function gracefulShutdown() {
    Object.values(globalState.allSockets).forEach((sock) => sock.emit('serverRestartingNow'));
    console.log('Graceful shutdown request');
    process.exit();
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// RECOVERING SAVED GAMES!
savedGameObj.find({}).exec((err, foundSaveGameArray) => {
    if (err) {
        console.log(err);
        return;
    }

    Object.values(foundSaveGameArray).forEach((foundSaveGame) => {
        const storedData = JSON.parse(foundSaveGame.room);

        globalState.rooms[storedData.roomId] = new gameRoom();

        Object.assign(globalState.rooms[storedData.roomId], storedData);

        globalState.rooms[storedData.roomId].restartSaved = true;
        globalState.rooms[storedData.roomId].savedGameRecordId = foundSaveGame.id;
        globalState.rooms[storedData.roomId].recoverGame(storedData);
        globalState.rooms[storedData.roomId].callback = socketCallback;
    });
});

module.exports = function (io) {
    // SOCKETS for each connection
    globalState.io = io;
    io.sockets.on('connection', async (socket) => {
        if (socket.request.isAuthenticated()) {
            // console.log("User is authenticated");
        } else {
            // console.log("User is not authenticated");
            socket.emit('alert', 'You are not authenticated.');
            return;
        }

        // remove any duplicate sockets
        for (let i = 0; i < globalState.allSockets.length; i += 1) {
            if (globalState.allSockets[i].request.user.id === socket.request.user.id) {
                globalState.allSockets[i].disconnect(true);
            }
        }

        socket.request.displayUsername = socket.request.user.username;
        // Grab their rewards
        socket.rewards = await getRewardsObj.getAllRewardsForUser(socket.request.user);
        console.log('Socket rewards: ');
        console.log(socket.rewards);

        socket = applyApplicableRewards(socket);

        // now push their socket in
        globalState.allSockets.push(socket);


        // slight delay while client loads
        setTimeout(() => {
            // check if they have a ban or a mute
            for (var i = 0; i < globalState.currentModAtions.length; i++) {
                if (globalState.currentModAtions[i].bannedPlayer.id && socket.request.user.id.toString() === globalState.currentModAtions[i].bannedPlayer.id.toString()) {
                    if (globalState.currentModAtions[i].type === 'mute') {
                        socket.emit('muteNotification', globalState.currentModAtions[i]);
                    } else if (globalState.currentModAtions[i].type === 'ban') {
                        socket.emit('redirect', '/');
                        socket.disconnect();
                    }
                }
            }

            console.log(`${socket.request.user.username} has connected under socket ID: ${socket.id}`);

            // send the user its ID to store on their side.
            socket.emit('username', socket.request.user.username);
            // send the user the list of commands
            socket.emit('commands', userCommands);

            // initialise not mod and not admin
            socket.isModSocket = false;
            socket.isAdminSocket = false;

            // if the mods name is inside the array
            if (modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
                // promote to mod socket
                socket.isModSocket = true;

                // send the user the list of commands
                socket.emit('modCommands', modCommands);

                // mcompareips
                setTimeout(() => { actionsObj.modCommands.mcompareips.run(null, socket); }, 3000);

                avatarRequest.find({ processed: false }).exec((err, allAvatarRequests) => {
                    if (err) { console.log(err); } else {
                        socket.emit('', modCommands);

                        setTimeout(() => {
                            if (allAvatarRequests.length !== 0) {
                                if (allAvatarRequests.length === 1) {
                                    socket.emit('allChatToClient', { message: `There is ${allAvatarRequests.length} pending custom avatar request.`, classStr: 'server-text' });
                                    socket.emit('roomChatToClient', { message: `There is ${allAvatarRequests.length} pending custom avatar request.`, classStr: 'server-text' });
                                } else {
                                    socket.emit('allChatToClient', { message: `There are ${allAvatarRequests.length} pending custom avatar requests.`, classStr: 'server-text' });
                                    socket.emit('roomChatToClient', { message: `There are ${allAvatarRequests.length} pending custom avatar requests.`, classStr: 'server-text' });
                                }
                            } else {
                                socket.emit('allChatToClient', { message: 'There are no pending custom avatar requests!', classStr: 'server-text' });
                                socket.emit('roomChatToClient', { message: 'There are no pending custom avatar requests!', classStr: 'server-text' });
                            }
                        }, 3000);
                    }
                });
            }

            // if the admin name is inside the array
            if (adminsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
                // promote to admin socket
                socket.isAdminSocket = true;

                // send the user the list of commands
                socket.emit('adminCommands', adminCommands);
            }

            socket.emit('checkSettingsResetDate', DATE_RESET_REQUIRED);
            socket.emit('checkNewUpdate', { date: NEW_UPDATE_NOTIFICATION_REQUIRED, msg: updateMessage });
            socket.emit('checkNewPlayerShowIntro', '');
            // Pass in the gameModes for the new room menu.
            socket.emit('gameModes', gameModeNames);

            User.findOne({ username: socket.request.user.username }).exec((err, foundUser) => {
                if (foundUser.mutedPlayers) {
                    socket.emit('updateMutedPlayers', foundUser.mutedPlayers);
                }
            });


            // automatically join the all chat
            socket.join('allChat');
            // socket sends to all players
            const data = {
                message: `${socket.request.user.username} has joined the lobby.`,
                classStr: 'server-text-teal',
            };
            sendToAllChat(globalState, data);

            updateCurrentPlayersList();
            updateCurrentGamesList(io);
            // message mods if player's ip matches another player
            matchedIpsUsernames = [];
            const joiningIpAddress = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
            const joiningUsername = socket.request.user.username;
            for (var i = 0; i < globalState.allSockets.length; i++) {
                const clientIpAddress = globalState.allSockets[i].request.headers['x-forwarded-for'] || globalState.allSockets[i].request.connection.remoteAddress;
                const clientUsername = globalState.allSockets[i].request.user.username;
                // console.log(clientUsername);
                // console.log(clientIpAddress);
                if (clientIpAddress === joiningIpAddress && clientUsername !== joiningUsername) matchedIpsUsernames.push(clientUsername);
            }
            if (matchedIpsUsernames.length > 0) {
                sendToAllMods(io, { message: `MOD WARNING! '${socket.request.user.username}' has just logged in with the same IP as: `, classStr: 'server-text' });
                sendToAllMods(io, { message: '-------------------------', classStr: 'server-text' });
                for (var i = 0; i < matchedIpsUsernames.length; i++) {
                    sendToAllMods(io, { message: matchedIpsUsernames[i], classStr: 'server-text' });
                }
                sendToAllMods(io, { message: '-------------------------', classStr: 'server-text' });
            }
        }, 1000);


        // when a user disconnects/leaves the whole website
        socket.on('disconnect', disconnect);

        socket.on('modAction', async (data) => {
            if (modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
                // var parsedData = JSON.parse(data);
                const newModAction = {};
                let userNotFound = false;

                await data.forEach(async (item) => {
                    if (item.name === 'banPlayerUsername') {
                        // not case sensitive
                        await User.findOne({ usernameLower: item.value.toLowerCase() }, (err, foundUser) => {
                            if (err) { console.log(err); } else {
                                // foundUser = foundUser[0];
                                if (!foundUser) {
                                    socket.emit('messageCommandReturnStr', { message: 'User not found. Please check spelling and caps.', classStr: 'server-text' });
                                    userNotFound = true;
                                    return;
                                }
                                // console.log(foundUser);
                                newModAction.bannedPlayer = {};
                                newModAction.bannedPlayer.id = foundUser._id;
                                newModAction.bannedPlayer.username = foundUser.username;
                                newModAction.bannedPlayer.usernameLower = foundUser.usernameLower;

                                socket.emit('messageCommandReturnStr', { message: 'User found, Adding in details...\t', classStr: 'server-text' });
                            }
                        });
                    } else if (item.name === 'typeofmodaction') {
                        newModAction.type = item.value;
                    } else if (item.name === 'reasonofmodaction') {
                        newModAction.reason = item.value;
                    } else if (item.name === 'durationofmodaction') {
                        const oneSec = 1000;
                        const oneMin = oneSec * 60;
                        const oneHr = oneMin * 60;
                        const oneDay = oneHr * 24;
                        const oneMonth = oneDay * 30;
                        const oneYear = oneMonth * 12;
                        // 30 min, 3hr, 1 day, 3 day, 7 day, 1 month
                        const durations = [
                            oneMin * 30,
                            oneHr * 3,
                            oneDay,
                            oneDay * 3,
                            oneDay * 7,
                            oneMonth,
                            oneMonth * 6,
                            oneYear,
                            oneYear * 1000,
                        ];
                        newModAction.durationToBan = new Date(durations[item.value]);
                    } else if (item.name === 'descriptionByMod') {
                        newModAction.descriptionByMod = item.value;
                    }
                });

                if (userNotFound === true) {
                    return;
                }

                await User.findById(socket.request.user.id, (err, foundUser) => {
                    if (err) { console.log(err); } else {
                        newModAction.modWhoBanned = {};
                        newModAction.modWhoBanned.id = foundUser._id;
                        newModAction.modWhoBanned.username = foundUser.username;
                    }
                });

                newModAction.whenMade = new Date();
                newModAction.whenRelease = newModAction.whenMade.getTime() + newModAction.durationToBan.getTime();

                setTimeout(() => {
                    // console.log(newModAction);
                    if (userNotFound === false && newModAction.bannedPlayer && newModAction.bannedPlayer.username) {
                        modAction.create(newModAction, (err, newModActionCreated) => {
                            if (newModActionCreated !== undefined) {
                                // console.log(newModActionCreated);
                                // push new mod action into the array of currently active ones loaded.
                                globalState.currentModAtions.push(newModActionCreated);
                                // if theyre online
                                if (newModActionCreated.type === 'ban' && globalState.allSockets[getIndexFromUsername(globalState.allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)]) {
                                    globalState.allSockets[getIndexFromUsername(globalState.allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)].disconnect(true);
                                } else if (newModActionCreated.type === 'mute' && globalState.allSockets[getIndexFromUsername(globalState.allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)]) {
                                    globalState.allSockets[getIndexFromUsername(globalState.allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)].emit('muteNotification', newModActionCreated);
                                }

                                socket.emit('messageCommandReturnStr', { message: `${newModActionCreated.bannedPlayer.username} has received a ${newModActionCreated.type} modAction. Thank you :).`, classStr: 'server-text' });
                            } else {
                                socket.emit('messageCommandReturnStr', { message: 'Something went wrong...', classStr: 'server-text' });
                            }
                        });
                    } else {
                        let str = 'Something went wrong... Contact the admin! Details: ';
                        str += `UserNotFound: ${userNotFound}`;
                        str += `\t newModAction.bannedPlayer: ${newModAction.bannedPlayer}`;
                        str += `\t newModAction.username: ${newModAction.username}`;
                        socket.emit('messageCommandReturnStr', { message: str, classStr: 'server-text' });
                    }
                }, 3000);
            } else {
                // create a report. someone doing something bad.
            }
        });

        //= ======================================
        // COMMANDS
        //= ======================================

        socket.on('messageCommand', messageCommand);
        socket.on('interactUserPlayed', interactUserPlayed);
        // when a user tries to send a message to all chat
        socket.on('allChatFromClient', allChatFromClient);
        // when a user tries to send a message to room
        socket.on('roomChatFromClient', roomChatFromClient);
        // when a new room is created
        socket.on('newRoom', newRoom);
        // when a player joins a room
        socket.on('join-room', joinRoom);
        socket.on('join-game', joinGame);
        socket.on('standUpFromGame', standUpFromGame);

        // when a player leaves a room
        socket.on('leave-room', leaveRoom);
        socket.on('player-ready', playerReady);
        socket.on('player-not-ready', playerNotReady);
        socket.on('startGame', startGame);
        socket.on('kickPlayer', kickPlayer);
        socket.on('update-room-max-players', updateRoomMaxPlayers);
        socket.on('update-room-game-mode', updateRoomGameMode);

        //* ***********************
        // game data stuff
        //* ***********************
        socket.on('gameMove', gameMove);
        socket.on('setClaim', setClaim);
    });
};

function applyApplicableRewards(socket) {
    const getDisplayUsernameWithBadge = (title, text) => `${socket.request.displayUsername} <span class='badge' data-toggle='tooltip' data-placement='right' title='${title}' style='transform: scale(0.9) translateY(-9%); background-color: rgb(150, 150, 150)'>${text}</span>`;

    // Admin badge
    if (socket.rewards.includes(REWARDS.ADMIN_BADGE)) {
        socket.request.displayUsername = getDisplayUsernameWithBadge('Admin', 'A');
    }
    // Moderator badge
    else if (socket.rewards.includes(REWARDS.MOD_BADGE)) {
        socket.request.displayUsername = getDisplayUsernameWithBadge('Moderator', 'M');
    }

    // Tier4 badge
    if (socket.rewards.includes(REWARDS.TIER4_BADGE)) {
        socket.request.displayUsername = getDisplayUsernameWithBadge('Patreon T4', 'T4');
    }
    // Tier3 badge
    else if (socket.rewards.includes(REWARDS.TIER3_BADGE)) {
        socket.request.displayUsername = getDisplayUsernameWithBadge('Patreon T3', 'T3');
    }
    // Tier2 badge
    else if (socket.rewards.includes(REWARDS.TIER2_BADGE)) {
        socket.request.displayUsername = getDisplayUsernameWithBadge('Patreon T2', 'T2');
    }
    // Tier1 badge
    else if (socket.rewards.includes(REWARDS.TIER1_BADGE)) {
        socket.request.displayUsername = getDisplayUsernameWithBadge('Patreon T1', 'T1');
    }

    return socket;
}

function updateCurrentPlayersList() {
    const allDisplayUsernames = globalState.allSockets.map((sock) => sock.request.displayUsername || sock.request.user.username).sort((a, b) => {
        const textA = a.toUpperCase();
        const textB = b.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });

    globalState.io.in('allChat').emit('update-current-players-list', allDisplayUsernames);
}

function updateCurrentGamesList() {
    // prepare room data to send to players.
    const gamesList = globalState.rooms.map((room) => {
        if (!room) return;
        const obj = {
            status: room.getStatus(),
            passwordLocked: room.joinPassword !== undefined,
            roomId: room.roomId,
            gameMode: room.gameMode.charAt(0).toUpperCase() + room.gameMode.slice(1),
            hostUsername: room.host,
            maxNumPlayers: room.maxNumPlayers,
            numOfSpectatorsInside: room.allSockets.length - room.socketsOfPlayers.length,
        };

        if (room.gameStarted) {
            obj.numOfPlayersInside = room.playersInGame.length;
            obj.missionHistory = room.missionHistory;
            obj.missionNum = room.missionNum;
            obj.pickNum = room.pickNum;
        } else {
            obj.numOfPlayersInside = room.socketsOfPlayers.length;
        }
        return obj;
    });

    globalState.allSockets.forEach((sock) => {
        sock.emit('update-current-games-list', gamesList);
    });
}

function textLengthFilter(str) {
    if (str.length > TEXT_LENGTH_LIMIT) {
        return str.slice(0, TEXT_LENGTH_LIMIT);
    }

    return str;
}

function sendToAllMods(io, data) {
    const date = new Date();
    data.dateCreated = date;

    globalState.allSockets.forEach((sock) => {
        if (modsArray.indexOf(sock.request.user.username.toLowerCase()) !== -1) {
            sock.emit('allChatToClient', data);
            sock.emit('roomChatToClient', data);
        }
    });
}

function isMuted(socket) {
    returnVar = false;
    globalState.currentModAtions.forEach((oneModAction) => {
        if (oneModAction.type === 'mute' && oneModAction.bannedPlayer && oneModAction.bannedPlayer.id && oneModAction.bannedPlayer.id.toString() === socket.request.user.id.toString()) {
            socket.emit('muteNotification', oneModAction);
            returnVar = true;
        }
    });

    return returnVar;
}

function playerLeaveRoomCheckDestroy(socket) {
    if (socket.request.user.inRoomId && globalState.rooms[socket.request.user.inRoomId]) {
        // leave the room
        globalState.rooms[socket.request.user.inRoomId].playerLeaveRoom(socket);

        const toDestroy = globalState.rooms[socket.request.user.inRoomId].destroyRoom;

        if (toDestroy) {
            destroyRoom(socket.request.user.inRoomId);
        }

        // if room is frozen for more than 1hr then remove.
        if (globalState.rooms[socket.request.user.inRoomId]
            && globalState.rooms[socket.request.user.inRoomId].timeFrozenLoaded
            && globalState.rooms[socket.request.user.inRoomId].getStatus() === 'Frozen'
            && globalState.rooms[socket.request.user.inRoomId].globalState.allSockets.length === 0) {
            const curr = new Date();
            const timeToKill = 1000 * 60 * 5; // 5 mins
            // var timeToKill = 1000*10; //10s
            if ((curr.getTime() - globalState.rooms[socket.request.user.inRoomId].timeFrozenLoaded.getTime()) > timeToKill) {
                destroyRoom(socket.request.user.inRoomId);

                console.log(`Been more than ${timeToKill / 1000} seconds, removing this frozen game.`);
            } else {
                console.log(`Frozen game has only loaded for ${(curr.getTime() - globalState.rooms[socket.request.user.inRoomId].timeFrozenLoaded.getTime()) / 1000} seconds, Dont remove yet.`);
            }
        }

        socket.request.user.inRoomId = undefined;

        updateCurrentGamesList();
    }
}

function disconnect(data) {
    // debugging
    console.log(`${this.request.user.username} has left the lobby.`);
    // remove them from all sockets
    globalState.allSockets.splice(globalState.allSockets.indexOf(this), 1);

    // send out the new updated current player list
    updateCurrentPlayersList();
    // tell all clients that the user has left
    const toSend = {
        message: `${this.request.user.username} has left the lobby.`,
        classStr: 'server-text-teal',
    };
    sendToAllChat(globalState, toSend);

    // Note, by default when this disconnects, it leaves from all globalState.rooms.
    // If user disconnected from within a room, the leave room function will send a message to other players in room.

    const { username } = this.request.user;
    const { inRoomId } = this.request.user;

    playerLeaveRoomCheckDestroy(this);

    // if they are in a room, say they're leaving the room.
    const newToSend = {
        message: `${username} has left the room.`,
        classStr: 'server-text-teal',
        dateCreated: new Date(),
    };
    sendToRoomChat(globalState, inRoomId, newToSend);
}

function messageCommand(data) {
    // console.log("data0: " + data.command);
    // console.log("mod command exists: " + modCommands[data.command]);
    // console.log("Index of mods" + modsArray.indexOf(socket.request.user.username.toLowerCase()));
    if (userCommands[data.command]) {
        const dataToSend = userCommands[data.command].run(globalState, data, this);
        this.emit('messageCommandReturnStr', dataToSend);
    } else if (modCommands[data.command] && modsArray.indexOf(this.request.user.username.toLowerCase()) !== -1) {
        const dataToSend = modCommands[data.command].run(globalState, data, this);
        this.emit('messageCommandReturnStr', dataToSend);
    } else if (adminCommands[data.command] && adminsArray.indexOf(this.request.user.username.toLowerCase()) !== -1) {
        const dataToSend = adminCommands[data.command].run(globalState, data, this);
        this.emit('messageCommandReturnStr', dataToSend);
    } else {
        const dataToSend = {
            message: 'Invalid command.',
            classStr: 'server-text',
            dateCreated: new Date(),
        };

        this.emit('messageCommandReturnStr', dataToSend);
    }
}

function interactUserPlayed(data) {
    // socket.emit("interactUserPlayed", {success: false, interactedBy: data.username, myUsername: ownUsername, verb: data.verb, verbPast: data.verbPast});
    const socketWhoInitiatedInteract = globalState.allSockets[getIndexFromUsername(globalState.allSockets, data.interactedBy, true)];

    if (socketWhoInitiatedInteract) {
        let messageStr;
        if (data.success === true) {
            messageStr = `${data.myUsername} was ${data.verbPast}!`;
        } else {
            messageStr = `${data.myUsername} was not ${data.verbPast}, most likely because they have already been ${data.verbPast} recently.`;
        }
        const dataToSend = {
            message: messageStr,
            classStr: 'server-text',
            dateCreated: new Date(),
        };

        socketWhoInitiatedInteract.emit('messageCommandReturnStr', dataToSend);
    }
}

function allChatFromClient(data) {
    if (isMuted(this)) return;

    console.log(`allchat: ${data.message} by: ${this.request.user.username}`);
    // get the username and put it into the data object

    // if the username is not valid, i.e. one that they actually logged in as
    if (getPlayerUsernamesFromAllSockets(globalState).indexOf(this.request.user.username) === -1) {
        return;
    }

    data.username = this.request.displayUsername ? this.request.displayUsername : this.request.user.username;
    // send out that data object to all other clients (except the one who sent the message)
    data.message = textLengthFilter(data.message);
    // no classStr since its a player message

    sendToAllChat(globalState, data);
}

function roomChatFromClient(data) {
    if (isMuted(this)) return;

    console.log(`roomchat: ${data.message} by: ${this.request.user.username}`);
    // get the username and put it into the data object

    // if the username is not valid, i.e. one that they actually logged in as
    if (getPlayerUsernamesFromAllSockets(globalState).indexOf(this.request.user.username) === -1) {
        return;
    }

    data.username = this.request.displayUsername ? this.request.displayUsername : this.request.user.username;

    data.message = textLengthFilter(data.message);
    data.dateCreated = new Date();

    if (this.request.user.inRoomId) {
        // send out that data object to all clients in room

        sendToRoomChat(globalState, this.request.user.inRoomId, data);
        // globalState.io.in(data.roomId).emit("roomChatToClient", data);
    }
}

function newRoom(dataObj) {
    if (isMuted(this) || !dataObj) return;

    // while globalState.rooms exist already (in case of a previously saved and retrieved game)
    while (globalState.rooms[globalState.nextRoomId]) {
        globalState.nextRoomId++;
    }
    globalState.rooms[globalState.nextRoomId] = new gameRoom(this.request.user.username, globalState.nextRoomId, globalState.io, dataObj.maxNumPlayers, dataObj.newRoomPassword, dataObj.gameMode, socketCallback);
    const privateStr = (dataObj.newRoomPassword === '') ? '' : 'private ';
    // broadcast to all chat
    const data = {
        message: `${this.request.user.username} has created ${privateStr}room ${globalState.nextRoomId}.`,
        classStr: 'server-text',
    };
    sendToAllChat(globalState, data);

    // console.log(data.message);

    // send to allChat including the host of the game
    // globalState.io.in("allChat").emit("new-game-created", str);
    // send back room id to host so they can auto connect
    this.emit('auto-join-room-id', globalState.nextRoomId, dataObj.newRoomPassword);

    // increment index for next game
    globalState.nextRoomId++;

    updateCurrentGamesList();
}


function joinRoom(roomId, inputPassword) {
    const room = globalState.rooms[roomId];
    // if the room exists
    if (!room) return;
    // join the room
    if (!room.playerJoinRoom(this, inputPassword)) return;

    // sends to players and specs
    room.distributeGameData();

    // set the room id into the this obj
    this.request.user.inRoomId = roomId;

    // join the room chat
    this.join(roomId);

    // emit to say to others that someone has joined
    const data = {
        message: `${this.request.user.username} has joined the room.`,
        classStr: 'server-text-teal',
        dateCreated: new Date(),
    };

    sendToRoomChat(globalState, roomId, data);

    updateCurrentGamesList();
}


function joinGame(roomId) {
    if (isMuted(this)
    || !globalState.rooms[roomId]
    || globalState.rooms[roomId].getStatus() === 'Waiting') return;
    // if the room has not started yet, throw them into the room
    const ToF = globalState.rooms[roomId].playerSitDown(this);
    console.log(`${this.request.user.username} has joined room ${roomId}: ${ToF}`);
}

function standUpFromGame() {
    const { inRoomId } = this.request.user;

    if (isMuted(this) || !globalState.rooms[inRoomId]) return;

    // if the room has not started yet, remove them from players list
    if (globalState.rooms[inRoomId].getStatus() === 'Waiting') { globalState.rooms[inRoomId].playerStandUp(this); }
}

function leaveRoom() {
    if (!globalState.rooms[this.request.user.inRoomId]) return;
    console.log(`${this.request.user.username} is leaving room: ${this.request.user.inRoomId}`);

    // broadcast to let others know
    const data = {
        message: `${this.request.user.username} has left the room.`,
        classStr: 'server-text-teal',
        dateCreated: new Date(),
    };
    sendToRoomChat(globalState, this.request.user.inRoomId, data);

    // leave the room chat
    this.leave(this.request.user.inRoomId);
    playerLeaveRoomCheckDestroy(this);
    updateCurrentGamesList();
}

function playerReady(username) {
    if (!globalState.rooms[this.request.user.inRoomId]) return;
    const data = {
        message: `${username} is ready.`,
        classStr: 'server-text',
        dateCreated: new Date(),
    };
    sendToRoomChat(globalState, this.request.user.inRoomId, data);
}

function playerNotReady(username) {
    if (!globalState.rooms[this.request.user.inRoomId]) return;
    globalState.rooms[this.request.user.inRoomId].playerNotReady(username);
    const data = {
        message: `${username} is not ready.`,
        classStr: 'server-text',
        dateCreated: new Date(),
    };
    sendToRoomChat(globalState, this.request.user.inRoomId, data);
}

function startGame(data, gameMode) {
    // start the game
    const room = globalState.rooms[this.request.user.inRoomId];
    if (room && this.request.user.inRoomId && this.request.user.username === room.host) {
        room.hostTryStartGame(data, gameMode);
        // this.emit("update-room-players", globalState.rooms[roomId].getPlayers());
    } else {
        // console.log("Room doesn't exist or user is not host, cannot start game");
        this.emit('danger-alert', 'You are not the host. You cannot start the game.');
        return;
    }
    updateCurrentGamesList(globalState.io);
}

function kickPlayer(username) {
    console.log(`received kick player request: ${username}`);
    if (globalState.rooms[this.request.user.inRoomId]) {
        globalState.rooms[this.request.user.inRoomId].kickPlayer(username, this);
    }
}

function setClaim(data) {
    if (globalState.rooms[this.request.user.inRoomId]) {
        globalState.rooms[this.request.user.inRoomId].setClaim(this, data);
    }
}

function gameMove(data) {
    if (!globalState.rooms[this.request.user.inRoomId]) return;
    globalState.rooms[this.request.user.inRoomId].gameMove(this, data);

    if (globalState.rooms[this.request.user.inRoomId].finished === true) {
        deleteSaveGameFromDb(globalState.rooms[this.request.user.inRoomId]);
    } else {
        const roomToSave = globalState.rooms[this.request.user.inRoomId];

        if (!roomToSave.gameStarted || roomToSave.finished) return;

        if (!roomToSave.savedGameRecordId) {
            savedGameObj.create({ room: JSON.stringify(roomToSave) }, (err, savedGame) => {
                if (err) {
                    console.log(err);
                } else {
                    globalState.rooms[globalState.rooms.indexOf(roomToSave)].savedGameRecordId = savedGame.id;
                }
            });
        } else {
            savedGameObj.findByIdAndUpdate(roomToSave.savedGameRecordId, { room: JSON.stringify(roomToSave) });
        }
    }

    updateCurrentGamesList(globalState.io);
}

function updateRoomGameMode(gameMode) {
    if (globalState.rooms[this.request.user.inRoomId]) {
        globalState.rooms[this.request.user.inRoomId].updateGameModesInRoom(this, gameMode);
    }
    updateCurrentGamesList();
}

function updateRoomMaxPlayers(number) {
    if (globalState.rooms[this.request.user.inRoomId]) {
        globalState.rooms[this.request.user.inRoomId].updateMaxNumPlayers(this, number);
    }
    updateCurrentGamesList();
}
