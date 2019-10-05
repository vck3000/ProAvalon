// sockets
const axios = require('axios');
const gameRoom = require('../gameplay/game');

const savedGameObj = require('../models/savedGame');
const modAction = require('../models/modAction');

let currentModActions = [];
const myNotification = require('../models/notification');
const createNotificationObj = require('../myFunctions/createNotification');

const getRewards = require('../rewards/getRewards');

const getRewardsObj = new getRewards();

const REWARDS = require('../rewards/constants');

const avatarRequest = require('../models/avatarRequest');
const User = require('../models/user');
const banIp = require('../models/banIp');
const JSON = require('circular-json');
const modsArray = require('../modsadmins/mods');
const adminsArray = require('../modsadmins/admins');

const _bot = require('./bot');

const { enabledBots } = _bot;
const { makeBotAPIRequest } = _bot;
const { SimpleBotSocket } = _bot;
const { APIBotSocket } = _bot;

const dateResetRequired = 1543480412695;

const newUpdateNotificationRequired = 1565505539914;
const updateMessage = `

<h1>Patreon Rewards!</h1>

<br>

Check out the forums for more information on how to connect your Patreon account :).
`;

const allSockets = [];
const rooms = [];

// retain only 5 mins.
const allChatHistory = [];
const allChat5Min = [];

let nextRoomId = 1;

// Get all the possible gameModes
const fs = require('fs');

const gameModeNames = [];
fs.readdirSync('./gameplay/').filter((file) => {
    if (fs.statSync(`${'./gameplay' + '/'}${file}`).isDirectory() === true && file !== 'commonPhases') {
        gameModeNames.push(file);
    }
});

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
    sendWarning();

    console.log('Graceful shutdown request');
    process.exit();
}


function sendWarning() {
    for (const key in allSockets) {
        if (allSockets.hasOwnProperty(key)) {
            allSockets[key].emit('serverRestartingNow');
        }
    }
}

function saveGameToDb(roomToSave) {
    if (roomToSave.gameStarted === true && roomToSave.finished !== true) {
        if (roomToSave.savedGameRecordId === undefined) {
            savedGameObj.create({ room: JSON.stringify(roomToSave) }, (err, savedGame) => {
                if (err) {
                    console.log(err);
                } else {
                    rooms[rooms.indexOf(roomToSave)].savedGameRecordId = savedGame.id;
                    // console.log("Successfully created this save game");
                }
            });
        } else {
            savedGameObj.findByIdAndUpdate(roomToSave.savedGameRecordId, { room: JSON.stringify(roomToSave) }, (err, savedGame) => {
                // console.log("Successfully saved this game");
            });
        }
    }
}
function deleteSaveGameFromDb(room) {
    savedGameObj.findByIdAndRemove(room.savedGameRecordId, (err) => {
        if (err) {
            console.log(err);
        } else {
            // console.log("Successfully removed this save game from db");
        }
    });
}


// RECOVERING SAVED GAMES!
savedGameObj.find({}).exec((err, foundSaveGameArray) => {
    if (err) { console.log(err); } else {
        for (const key in foundSaveGameArray) {
            if (foundSaveGameArray.hasOwnProperty(key)) {
                const foundSaveGame = foundSaveGameArray[key];

                if (foundSaveGame) {
                    const storedData = JSON.parse(foundSaveGame.room);

                    rooms[storedData.roomId] = new gameRoom();

                    Object.assign(rooms[storedData.roomId], storedData);

                    rooms[storedData.roomId].restartSaved = true;
                    rooms[storedData.roomId].savedGameRecordId = foundSaveGame.id;
                    rooms[storedData.roomId].recoverGame(storedData);
                    rooms[storedData.roomId].callback = socketCallback;
                }
            }
        }
    }
});

const lastWhisperObj = {};
var pmmodCooldowns = {};
const PMMOD_TIMEOUT = 3000; // 3 seconds
var actionsObj = {
    adminCommands: {
        a: {
            command: 'a',
            help: '/a: ...shows mods commands',
            run(data) {
                const { args } = data;
                // do stuff
                const dataToReturn = [];
                let i = 0;
                i++;

                for (const key in actionsObj.adminCommands) {
                    if (actionsObj.adminCommands.hasOwnProperty(key)) {
                        if (!actionsObj.adminCommands[key].modsOnly) {
                            dataToReturn[i] = { message: actionsObj.adminCommands[key].help, classStr: 'server-text' };
                            i++;
                        }
                    }
                }
                return dataToReturn;
            },
        },

        admintest: {
            command: 'admintest',
            help: '/admintest: Testing that only the admin can access this command',
            run(data) {
                const { args } = data;
                // do stuff
                return { message: 'admintest has been run.', classStr: 'server-text' };
            },
        },

        killS: {
            command: 'killS',
            help: '/killS: test kill',
            run(data) {
                const { args } = data;
                // do stuff
                process.exit(0);

                return { message: 'killS has been run.', classStr: 'server-text' };
            },
        },

        aram: {
            command: 'aram',
            help: '/aram: get the ram used',
            run(data) {
                const { args } = data;

                const used = process.memoryUsage().heapUsed / 1024 / 1024;
                // console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

                return { message: `The script uses approximately ${Math.round(used * 100) / 100} MB`, classStr: 'server-text' };
            },
        },

        aip: {
            command: 'aip',
            help: '/aip <player name>: Get the ip of the player.',
            async run(data, senderSocket) {
                const { args } = data;

                if (!args[1]) {
                    // console.log("a");
                    senderSocket.emit('messageCommandReturnStr', { message: 'Specify a username', classStr: 'server-text' });
                    return { message: 'Specify a username.', classStr: 'server-text' };
                }


                const slapSocket = allSockets[getIndexFromUsername(allSockets, args[1])];
                if (slapSocket) {
                    // console.log("b");
                    const clientIpAddress = slapSocket.request.headers['x-forwarded-for'] || slapSocket.request.connection.remoteAddress;

                    senderSocket.emit('messageCommandReturnStr', { message: clientIpAddress, classStr: 'server-text' });

                    return { message: 'slapSocket.request.user.username', classStr: 'server-text' };
                }

                // console.log("c");

                senderSocket.emit('messageCommandReturnStr', { message: 'No IP found or invalid username', classStr: 'server-text' });

                return { message: 'There is no such player.', classStr: 'server-text' };
            },
        },
        aipban: {
            command: 'aipban',
            help: '/aipban <ip>: Ban the IP of the IP given. /munban does not undo this ban. Contact ProNub to remove an IP ban.',
            run(data, senderSocket) {
                const { args } = data;

                if (!args[1]) {
                    senderSocket.emit('messageCommandReturnStr', { message: 'Specify an IP', classStr: 'server-text' });
                    return { message: 'Specify a username.', classStr: 'server-text' };
                }

                User.find({ usernameLower: senderSocket.request.user.username.toLowerCase() }).populate('notifications').exec((err, foundUser) => {
                    if (err) { console.log(err); } else if (foundUser) {
                        const banIpData = {
                            type: 'ip',
                            bannedIp: args[1],
                            usernamesAssociated: [],
                            modWhoBanned: { id: foundUser._id, username: foundUser.username },
                            whenMade: new Date(),
                        };

                        banIp.create(banIpData, (err, newBan) => {
                            if (err) { console.log(err); } else {
                                senderSocket.emit('messageCommandReturnStr', { message: `Successfully banned ip ${args[1]}`, classStr: 'server-text' });
                            }
                        });
                    } else {
                        // send error message back
                        senderSocket.emit('messageCommandReturnStr', { message: "Could not find your user data (your own one, not the person you're trying to ban)", classStr: 'server-text' });
                    }
                });
            },
        },
    },
};


const { userCommands } = actionsObj;
const { modCommands } = actionsObj;
const { adminCommands } = actionsObj;


function reloadCurrentModActions() {
    // load up all the modActions that are not released yet
    modAction.find({ whenRelease: { $gt: new Date() }, $or: [{ type: 'mute' }, { type: 'ban' }] }, (err, allModActions) => {
        // reset currentModActions
        currentModActions = [];
        for (let i = 0; i < allModActions.length; i++) {
            currentModActions.push(allModActions[i]);
        }
        // console.log("mute");
        // console.log(currentModActions);
    });
}


ioGlobal = {};

module.exports = function (io) {
    // SOCKETS for each connection
    ioGlobal = io;
    io.sockets.on('connection', async (socket) => {
        if (socket.request.isAuthenticated()) {
            // console.log("User is authenticated");
        } else {
            // console.log("User is not authenticated");
            socket.emit('alert', 'You are not authenticated.');
            return;
        }

        // remove any duplicate sockets
        for (let i = 0; i < allSockets.length; i++) {
            if (allSockets[i].request.user.id === socket.request.user.id) {
                allSockets[i].disconnect(true);
            }
        }

        socket.request.displayUsername = socket.request.user.username;
        // Grab their rewards
        socket.rewards = await getRewardsObj.getAllRewardsForUser(socket.request.user);
        console.log('Socket rewards: ');
        console.log(socket.rewards);

        socket = applyApplicableRewards(socket);

        // now push their socket in
        allSockets.push(socket);


        // slight delay while client loads
        setTimeout(() => {
            // check if they have a ban or a mute
            for (var i = 0; i < currentModActions.length; i++) {
                if (currentModActions[i].bannedPlayer.id && socket.request.user.id.toString() === currentModActions[i].bannedPlayer.id.toString()) {
                    if (currentModActions[i].type === 'mute') {
                        socket.emit('muteNotification', currentModActions[i]);
                    } else if (currentModActions[i].type === 'ban') {
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

            socket.emit('checkSettingsResetDate', dateResetRequired);
            socket.emit('checkNewUpdate', { date: newUpdateNotificationRequired, msg: updateMessage });
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
            sendToAllChat(io, data);

            updateCurrentPlayersList(io);
            // console.log("update current players list");
            // console.log(getPlayerUsernamesFromAllSockets());
            updateCurrentGamesList(io);
            // message mods if player's ip matches another player
            matchedIpsUsernames = [];
            const joiningIpAddress = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
            const joiningUsername = socket.request.user.username;
            for (var i = 0; i < allSockets.length; i++) {
                const clientIpAddress = allSockets[i].request.headers['x-forwarded-for'] || allSockets[i].request.connection.remoteAddress;
                const clientUsername = allSockets[i].request.user.username;
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
                                currentModActions.push(newModActionCreated);
                                // if theyre online
                                if (newModActionCreated.type === 'ban' && allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)]) {
                                    allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)].disconnect(true);
                                } else if (newModActionCreated.type === 'mute' && allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)]) {
                                    allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)].emit('muteNotification', newModActionCreated);
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

function socketCallback(action, room) {
    if (action === "finishGame") {
        var data = {
            message: `Room ${room.roomId} has finished!`,
            classStr: 'server-text-teal',
        };
        sendToAllChat(ioGlobal, data);
    }
}

var applyApplicableRewards = function (socket) {
    // Admin badge
    if (socket.rewards.includes(REWARDS.ADMIN_BADGE)) {
        socket.request.displayUsername = `${socket.request.displayUsername} <span class='badge' data-toggle='tooltip' data-placement='right' title='Admin' style='transform: scale(0.9) translateY(-9%); background-color: rgb(150, 150, 150)'>A</span>`;
        // socket.request.displayUsername = "[A] " + socket.request.displayUsername;
    }
    // Moderator badge
    else if (socket.rewards.includes(REWARDS.MOD_BADGE)) {
        socket.request.displayUsername = `${socket.request.displayUsername} <span class='badge' data-toggle='tooltip' data-placement='right' title='Moderator' style='transform: scale(0.9) translateY(-9%); background-color: rgb(150, 150, 150)'>M</span>`;
        // socket.request.displayUsername = "[M] " + socket.request.displayUsername;
    }


    // Tier4 badge
    if (socket.rewards.includes(REWARDS.TIER4_BADGE)) {
        socket.request.displayUsername = `${socket.request.displayUsername} <span class='badge' data-toggle='tooltip' data-placement='right' title='Patreon T4' style='transform: scale(0.9) translateY(-9%); background-color: rgb(150, 150, 150)'>T4</span>`;
    }
    // Tier3 badge
    else if (socket.rewards.includes(REWARDS.TIER3_BADGE)) {
        socket.request.displayUsername = `${socket.request.displayUsername} <span class='badge' data-toggle='tooltip' data-placement='right' title='Patreon T3' style='transform: scale(0.9) translateY(-9%); background-color: rgb(150, 150, 150)'>T3</span>`;
    }
    // Tier2 badge
    else if (socket.rewards.includes(REWARDS.TIER2_BADGE)) {
        socket.request.displayUsername = `${socket.request.displayUsername} <span class='badge' data-toggle='tooltip' data-placement='right' title='Patreon T2' style='transform: scale(0.9) translateY(-9%); background-color: rgb(150, 150, 150)'>T2</span>`;
    }
    // Tier1 badge
    else if (socket.rewards.includes(REWARDS.TIER1_BADGE)) {
        socket.request.displayUsername = `${socket.request.displayUsername} <span class='badge' data-toggle='tooltip' data-placement='right' title='Patreon T1' style='transform: scale(0.9) translateY(-9%); background-color: rgb(150, 150, 150)'>T1</span>`;
    }


    return socket;
};

var updateCurrentPlayersList = function () {
    ioGlobal.in('allChat').emit('update-current-players-list', getPlayerDisplayUsernamesFromAllSockets());
};

var updateCurrentGamesList = function () {
    // prepare room data to send to players.
    const gamesList = [];
    for (let i = 0; i < rooms.length; i++) {
        // If the game exists
        if (rooms[i]) {
            // create new array to send
            gamesList[i] = {};
            // get status of game
            gamesList[i].status = rooms[i].getStatus();

            if (rooms[i].joinPassword !== undefined) {
                gamesList[i].passwordLocked = true;
            } else {
                gamesList[i].passwordLocked = false;
            }
            // get room ID
            gamesList[i].roomId = rooms[i].roomId;
            gamesList[i].gameMode = rooms[i].gameMode.charAt(0).toUpperCase() + rooms[i].gameMode.slice(1);
            // console.log("Room " + rooms[i].roomId + " has host: " + rooms[i].host);
            gamesList[i].hostUsername = rooms[i].host;
            if (rooms[i].gameStarted === true) {
                gamesList[i].numOfPlayersInside = rooms[i].playersInGame.length;
                gamesList[i].missionHistory = rooms[i].missionHistory;
                gamesList[i].missionNum = rooms[i].missionNum;
                gamesList[i].pickNum = rooms[i].pickNum;
            } else {
                gamesList[i].numOfPlayersInside = rooms[i].socketsOfPlayers.length;
            }
            gamesList[i].maxNumPlayers = rooms[i].maxNumPlayers;
            gamesList[i].numOfSpectatorsInside = rooms[i].allSockets.length - rooms[i].socketsOfPlayers.length;
        }
    }
    allSockets.forEach((sock) => {
        sock.emit('update-current-games-list', gamesList);
    });
};


function textLengthFilter(str) {
    const lengthLimit = 500;

    if (str.length > lengthLimit) {
        return str.slice(0, lengthLimit);
    }

    return str;
}

const fiveMinsInMillis = 1000 * 60 * 5;

function sendToAllChat(io, data) {
    const date = new Date();
    data.dateCreated = date;


    allSockets.forEach((sock) => {
        sock.emit('allChatToClient', data);
    });

    allChatHistory.push(data);

    allChat5Min.push(data);

    let i = 0;

    while (date - allChat5Min[i].dateCreated > fiveMinsInMillis) {
        if (i >= allChat5Min.length) {
            break;
        }
        i++;
    }

    if (i !== 0) {
        allChat5Min.splice(0, i);
    }
}

function sendToRoomChat(io, roomId, data) {
    io.in(roomId).emit('roomChatToClient', data);
    if (rooms[roomId]) {
        rooms[roomId].addToChatHistory(data);
    }
}

function sendToAllMods(io, data) {
    const date = new Date();
    data.dateCreated = date;

    allSockets.forEach((sock) => {
        if (modsArray.indexOf(sock.request.user.username.toLowerCase()) !== -1) {
            sock.emit('allChatToClient', data);
            sock.emit('roomChatToClient', data);
        }
    });
}

function isMuted(socket) {
    returnVar = false;
    currentModActions.forEach((oneModAction) => {
        if (oneModAction.type === 'mute' && oneModAction.bannedPlayer && oneModAction.bannedPlayer.id && oneModAction.bannedPlayer.id.toString() === socket.request.user.id.toString()) {
            socket.emit('muteNotification', oneModAction);
            returnVar = true;
        }
    });

    return returnVar;
}

function destroyRoom(roomId) {
    deleteSaveGameFromDb(rooms[roomId]);

    // Stop bots thread if they are playing:
    if (rooms[roomId].interval) {
        clearInterval(rooms[roomId].interval);
        rooms[roomId].interval = undefined;
    }
    const thisGame = rooms[roomId];
    rooms[roomId].socketsOfPlayers.filter((socket) => socket.isBotSocket).forEach((botSocket) => {
        botSocket.handleGameOver(thisGame, 'complete', () => { }); // This room is getting destroyed. No need to leave.
    });

    rooms[roomId] = undefined;
}


function playerLeaveRoomCheckDestroy(socket) {
    if (socket.request.user.inRoomId && rooms[socket.request.user.inRoomId]) {
        // leave the room
        rooms[socket.request.user.inRoomId].playerLeaveRoom(socket);

        const toDestroy = rooms[socket.request.user.inRoomId].destroyRoom;

        if (toDestroy) {
            destroyRoom(socket.request.user.inRoomId);
        }

        // if room is frozen for more than 1hr then remove.
        if (rooms[socket.request.user.inRoomId]
            && rooms[socket.request.user.inRoomId].timeFrozenLoaded
            && rooms[socket.request.user.inRoomId].getStatus() === 'Frozen'
            && rooms[socket.request.user.inRoomId].allSockets.length === 0) {
            const curr = new Date();
            const timeToKill = 1000 * 60 * 5; // 5 mins
            // var timeToKill = 1000*10; //10s
            if ((curr.getTime() - rooms[socket.request.user.inRoomId].timeFrozenLoaded.getTime()) > timeToKill) {
                destroyRoom(socket.request.user.inRoomId);

                console.log(`Been more than ${timeToKill / 1000} seconds, removing this frozen game.`);
            } else {
                console.log(`Frozen game has only loaded for ${(curr.getTime() - rooms[socket.request.user.inRoomId].timeFrozenLoaded.getTime()) / 1000} seconds, Dont remove yet.`);
            }
        }

        socket.request.user.inRoomId = undefined;

        updateCurrentGamesList();
    }
}


function getPlayerDisplayUsernamesFromAllSockets() {
    const array = [];
    for (let i = 0; i < allSockets.length; i++) {
        array[i] = allSockets[i].request.displayUsername ? allSockets[i].request.displayUsername : allSockets[i].request.user.username;
    }
    array.sort((a, b) => {
        const textA = a.toUpperCase();
        const textB = b.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    return array;
}

function getPlayerUsernamesFromAllSockets() {
    const array = [];
    for (let i = 0; i < allSockets.length; i++) {
        array[i] = allSockets[i].request.user.username;
    }
    array.sort((a, b) => {
        const textA = a.toUpperCase();
        const textB = b.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    return array;
}

function getPlayerIdsFromAllSockets() {
    const array = [];
    for (let i = 0; i < allSockets.length; i++) {
        array[i] = allSockets[i].request.user.id;
    }
    return array;
}

function getIndexFromUsername(sockets, username, caseInsensitive) {
    if (sockets && username) {
        for (let i = 0; i < sockets.length; i++) {
            if (caseInsensitive) {
                if (sockets[i].request.user.username.toLowerCase() === username.toLowerCase()) {
                    return i;
                }
            } else if (sockets[i].request.user.username === username) {
                return i;
            }
        }
    }
    return undefined;
}

function disconnect(data) {
    // debugging
    console.log(`${this.request.user.username} has left the lobby.`);
    // remove them from all sockets
    allSockets.splice(allSockets.indexOf(this), 1);

    // send out the new updated current player list
    updateCurrentPlayersList();
    // tell all clients that the user has left
    var data = {
        message: `${this.request.user.username} has left the lobby.`,
        classStr: 'server-text-teal',
    };
    sendToAllChat(ioGlobal, data);

    // Note, by default when this disconnects, it leaves from all rooms.
    // If user disconnected from within a room, the leave room function will send a message to other players in room.

    const { username } = this.request.user;
    const { inRoomId } = this.request.user;

    playerLeaveRoomCheckDestroy(this);

    // if they are in a room, say they're leaving the room.
    var data = {
        message: `${username} has left the room.`,
        classStr: 'server-text-teal',
        dateCreated: new Date(),
    };
    sendToRoomChat(ioGlobal, inRoomId, data);
}

function messageCommand(data) {
    // console.log("data0: " + data.command);
    // console.log("mod command exists: " + modCommands[data.command]);
    // console.log("Index of mods" + modsArray.indexOf(socket.request.user.username.toLowerCase()));
    if (userCommands[data.command]) {
        var dataToSend = userCommands[data.command].run(data, this, ioGlobal);
        this.emit('messageCommandReturnStr', dataToSend);
    } else if (modCommands[data.command] && modsArray.indexOf(this.request.user.username.toLowerCase()) !== -1) {
        var dataToSend = modCommands[data.command].run(data, this, ioGlobal);
        this.emit('messageCommandReturnStr', dataToSend);
    } else if (adminCommands[data.command] && adminsArray.indexOf(this.request.user.username.toLowerCase()) !== -1) {
        var dataToSend = adminCommands[data.command].run(data, this, ioGlobal);
        this.emit('messageCommandReturnStr', dataToSend);
    } else {
        var dataToSend = {
            message: 'Invalid command.',
            classStr: 'server-text',
            dateCreated: new Date(),
        };

        this.emit('messageCommandReturnStr', dataToSend);
    }
}

function interactUserPlayed(data) {
    // socket.emit("interactUserPlayed", {success: false, interactedBy: data.username, myUsername: ownUsername, verb: data.verb, verbPast: data.verbPast});
    const socketWhoInitiatedInteract = allSockets[getIndexFromUsername(allSockets, data.interactedBy, true)];

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
    // this.emit("danger-alert", "test alert asdf");
    // debugging

    const toContinue = !isMuted(this);

    // console.log(toContinue);

    if (toContinue) {
        console.log(`allchat: ${data.message} by: ${this.request.user.username}`);
        // get the username and put it into the data object

        const validUsernames = getPlayerUsernamesFromAllSockets();

        // if the username is not valid, i.e. one that they actually logged in as
        if (validUsernames.indexOf(this.request.user.username) === -1) {
            return;
        }

        data.username = this.request.displayUsername ? this.request.displayUsername : this.request.user.username;
        // send out that data object to all other clients (except the one who sent the message)
        data.message = textLengthFilter(data.message);
        // no classStr since its a player message

        sendToAllChat(ioGlobal, data);
    }
}

function roomChatFromClient(data) {
    // this.emit("danger-alert", "test alert asdf");
    // debugging

    const toContinue = !isMuted(this);

    if (toContinue) {
        console.log(`roomchat: ${data.message} by: ${this.request.user.username}`);
        // get the username and put it into the data object

        const validUsernames = getPlayerUsernamesFromAllSockets();

        // if the username is not valid, i.e. one that they actually logged in as
        if (validUsernames.indexOf(this.request.user.username) === -1) {
            return;
        }

        data.username = this.request.displayUsername ? this.request.displayUsername : this.request.user.username;

        data.message = textLengthFilter(data.message);
        data.dateCreated = new Date();

        if (this.request.user.inRoomId) {
            // send out that data object to all clients in room

            sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);
            // ioGlobal.in(data.roomId).emit("roomChatToClient", data);
        }
    }
}

function newRoom(dataObj) {
    const toContinue = !isMuted(this);

    if (toContinue && dataObj) {
        // while rooms exist already (in case of a previously saved and retrieved game)
        while (rooms[nextRoomId]) {
            nextRoomId++;
        }
        rooms[nextRoomId] = new gameRoom(this.request.user.username, nextRoomId, ioGlobal, dataObj.maxNumPlayers, dataObj.newRoomPassword, dataObj.gameMode, socketCallback);
        const privateStr = (dataObj.newRoomPassword === '') ? '' : 'private ';
        // broadcast to all chat
        const data = {
            message: `${this.request.user.username} has created ${privateStr}room ${nextRoomId}.`,
            classStr: 'server-text',
        };
        sendToAllChat(ioGlobal, data);

        // console.log(data.message);

        // send to allChat including the host of the game
        // ioGlobal.in("allChat").emit("new-game-created", str);
        // send back room id to host so they can auto connect
        this.emit('auto-join-room-id', nextRoomId, dataObj.newRoomPassword);

        // increment index for next game
        nextRoomId++;

        updateCurrentGamesList();
    }
}


function joinRoom(roomId, inputPassword) {
    // console.log("inputpassword: " + inputPassword);

    // if the room exists
    if (rooms[roomId]) {
        // join the room
        if (rooms[roomId].playerJoinRoom(this, inputPassword) === true) {
            // sends to players and specs
            rooms[roomId].distributeGameData();

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
            sendToRoomChat(ioGlobal, roomId, data);

            updateCurrentGamesList();
        } else {
            // no need to do anything?
        }
    } else {
        // console.log("Game doesn't exist!");
    }
}


function joinGame(roomId) {
    const toContinue = !isMuted(this);

    if (toContinue) {
        if (rooms[roomId]) {
            // if the room has not started yet, throw them into the room
            // console.log("Game status is: " + rooms[roomId].getStatus());

            if (rooms[roomId].getStatus() === 'Waiting') {
                const ToF = rooms[roomId].playerSitDown(this);
                console.log(`${this.request.user.username} has joined room ${roomId}: ${ToF}`);
            } else {
                // console.log("Game has started, player " + this.request.user.username + " is not allowed to join.");
            }
        }
    }
}

function standUpFromGame() {
    const toContinue = !isMuted(this);

    const roomId = this.request.user.inRoomId;

    if (toContinue) {
        if (rooms[roomId]) {
            // if the room has not started yet, remove them from players list
            // console.log("Game status is: " + rooms[roomId].getStatus());

            if (rooms[roomId].getStatus() === 'Waiting') {
                const ToF = rooms[roomId].playerStandUp(this);
                // console.log(this.request.user.username + " has stood up from room " + roomId + ": " + ToF);
            } else {
                // console.log("Game has started, player " + this.request.user.username + " is not allowed to stand up.");
            }
        }
    }
}

function leaveRoom() {
    // console.log("In room id");
    // console.log(this.request.user.inRoomId);

    if (rooms[this.request.user.inRoomId]) {
        console.log(`${this.request.user.username} is leaving room: ${this.request.user.inRoomId}`);
        // broadcast to let others know

        const data = {
            message: `${this.request.user.username} has left the room.`,
            classStr: 'server-text-teal',
            dateCreated: new Date(),
        };
        sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);

        // leave the room chat
        this.leave(this.request.user.inRoomId);

        playerLeaveRoomCheckDestroy(this);


        updateCurrentGamesList();
    }
}

function playerReady(username) {
    if (rooms[this.request.user.inRoomId]) {
        const data = {
            message: `${username} is ready.`,
            classStr: 'server-text',
            dateCreated: new Date(),
        };
        sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);


        if (rooms[this.request.user.inRoomId].playerReady(username) === true) {
            // game will auto start if the above returned true
        }
    }
}

function playerNotReady(username) {
    if (rooms[this.request.user.inRoomId]) {
        rooms[this.request.user.inRoomId].playerNotReady(username);
        const data = {
            message: `${username} is not ready.`,
            classStr: 'server-text',
            dateCreated: new Date(),
        };
        sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);

        // ioGlobal.in(this.request.user.inRoomId).emit("player-not-ready", username + " is not ready.");
    }
}

function startGame(data, gameMode) {
    // start the game
    if (rooms[this.request.user.inRoomId]) {
        if (this.request.user.inRoomId && this.request.user.username === rooms[this.request.user.inRoomId].host) {
            rooms[this.request.user.inRoomId].hostTryStartGame(data, gameMode);
            // this.emit("update-room-players", rooms[roomId].getPlayers());
        } else {
            // console.log("Room doesn't exist or user is not host, cannot start game");
            this.emit('danger-alert', 'You are not the host. You cannot start the game.');
            return;
        }
    }
    updateCurrentGamesList(ioGlobal);
}

function kickPlayer(username) {
    console.log(`received kick player request: ${username}`);
    if (rooms[this.request.user.inRoomId]) {
        rooms[this.request.user.inRoomId].kickPlayer(username, this);
    }
}

function setClaim(data) {
    if (rooms[this.request.user.inRoomId]) {
        rooms[this.request.user.inRoomId].setClaim(this, data);
    }
}

function gameMove(data) {
    // console.log(data);
    if (rooms[this.request.user.inRoomId]) {
        rooms[this.request.user.inRoomId].gameMove(this, data);
        if (rooms[this.request.user.inRoomId]) {
            if (rooms[this.request.user.inRoomId].finished === true) {
                deleteSaveGameFromDb(rooms[this.request.user.inRoomId]);
            } else {
                saveGameToDb(rooms[this.request.user.inRoomId]);
            }
        }
        updateCurrentGamesList(ioGlobal);
    }
}

function updateRoomGameMode(gameMode) {
    if (rooms[this.request.user.inRoomId]) {
        rooms[this.request.user.inRoomId].updateGameModesInRoom(this, gameMode);
    }
    updateCurrentGamesList();
}

function updateRoomMaxPlayers(number) {
    if (rooms[this.request.user.inRoomId]) {
        rooms[this.request.user.inRoomId].updateMaxNumPlayers(this, number);
    }
    updateCurrentGamesList();
}
