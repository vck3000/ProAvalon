// sockets

const axios = require('axios');
const gameRoom = require('../gameplay/gameWrapper');

const savedGameObj = require('../models/savedGame');

const myNotification = require('../models/notification');
const createNotificationObj = require('../myFunctions/createNotification');

const { getAllRewardsForUser } = require('../rewards/getRewards');

const REWARDS = require('../rewards/constants');

const avatarRequest = require('../models/avatarRequest');
const User = require('../models/user');
const Ban = require('../models/ban');
const ModLog = require('../models/modLog');

const IPLinkedAccounts = require('../myFunctions/IPLinkedAccounts');

const JSON = require('circular-json');
const modsArray = require('../modsadmins/mods');
const adminsArray = require('../modsadmins/admins');

const moment = require('moment');

const _bot = require('./bot');

const { enabledBots } = _bot;
const { makeBotAPIRequest } = _bot;
const { SimpleBotSocket } = _bot;
const { APIBotSocket } = _bot;

const sanitizeHtml = require('sanitize-html');

const dateResetRequired = 1543480412695;

const newUpdateNotificationRequired = 1589095603188;
const updateMessage = `

<h1>Rating System Beta!</h1>

<br>

The beta period for the rating system has begun! Matches can now be either unranked or ranked. Unranked mode tracks only your personal winrate while ranked mode tracks a new player rating alongside your winrate.
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
  if (
    fs.statSync(`${'./gameplay' + '/'}${file}`).isDirectory() === true &&
    file !== 'commonPhases'
  ) {
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
    // Take out io stuff since we don't need it.
    let deepCopyRoom = JSON.parse(JSON.stringify(roomToSave));
    deepCopyRoom.io = undefined;
    deepCopyRoom.allSockets = undefined;
    deepCopyRoom.socketsOfPlayers = undefined;

    for (i = 0; i < deepCopyRoom.playersInGame.length; i++) {
      deepCopyRoom.playersInGame[i].request = {
        user: {},
      };
    }

    if (roomToSave.savedGameRecordId === undefined) {
      savedGameObj.create(
        { room: JSON.stringify(deepCopyRoom) },
        (err, savedGame) => {
          if (err) {
            console.log(err);
          } else {
            rooms[rooms.indexOf(roomToSave)].savedGameRecordId = savedGame.id;
            // console.log("Successfully created this save game");
          }
        }
      );
    } else {
      savedGameObj.findByIdAndUpdate(
        roomToSave.savedGameRecordId,
        { room: JSON.stringify(deepCopyRoom) },
        (err, savedGame) => {
          // console.log("Successfully saved this game");
        }
      );
    }
  }
}
function deleteSaveGameFromDb(room) {
  if (room) {
    savedGameObj.findByIdAndRemove(room.savedGameRecordId, (err) => {
      if (err) {
        console.log(err);
      } else {
        // console.log("Successfully removed this save game from db");
      }
    });
  }
}

setTimeout(async () => {
  console.log('Loading save games');
  let run = true;
  let i = 0;
  while (run) {
    // RECOVERING SAVED GAMES!
    await new Promise((resolve) => {
      savedGameObj
        .find({})
        .skip(i)
        .limit(1)
        .exec((err, foundSaveGameArr) => {
          const foundSaveGame = foundSaveGameArr[0];

          if (foundSaveGame && foundSaveGame.room) {
            const storedData = JSON.parse(foundSaveGame.room);
            console.log('Loaded room ' + storedData.roomId);

            rooms[storedData.roomId] = new gameRoom();

            Object.assign(rooms[storedData.roomId], storedData);

            rooms[storedData.roomId].restartSaved = true;
            rooms[storedData.roomId].savedGameRecordId = foundSaveGame.id;
            rooms[storedData.roomId].recoverGame(storedData);
            rooms[storedData.roomId].callback = socketCallback;
          } else {
            console.log('Finishing load save game');
            run = false;
          }
          resolve();
        });
    });

    i += 1;
  }
}, 1000);

const lastWhisperObj = {};
var pmmodCooldowns = {};
const PMMOD_TIMEOUT = 3000; // 3 seconds
var actionsObj = {
  userCommands: {
    help: {
      command: 'help',
      help: '/help: ...shows help',
      run(data) {
        // do stuff

        const dataToReturn = [];
        let i = 0;

        i++;

        for (const key in actionsObj.userCommands) {
          if (actionsObj.userCommands.hasOwnProperty(key)) {
            if (!actionsObj.userCommands[key].modsOnly) {
              dataToReturn[i] = {
                message: actionsObj.userCommands[key].help,
                classStr: 'server-text',
                dateCreated: new Date(),
              };
              i++;
            }
          }
        }
        return dataToReturn;
      },
    },

    buzz: {
      command: 'buzz',
      help: '/buzz <playername>: Buzz a player.',
      run(data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'buzz';

        return actionsObj.userCommands.interactUser.run(data, senderSocket);
      },
    },

    lick: {
      command: 'lick',
      help: '/lick <playername>: Lick a player.',
      run(data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'lick';

        return actionsObj.userCommands.interactUser.run(data, senderSocket);
      },
    },

    pat: {
      command: 'pat',
      help: '/pat <playername>: Pat a player.',
      run(data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'pat';

        return actionsObj.userCommands.interactUser.run(data, senderSocket);
      },
    },

    poke: {
      command: 'poke',
      help: '/poke <playername>: Poke a player.',
      run(data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'poke';

        return actionsObj.userCommands.interactUser.run(data, senderSocket);
      },
    },

    punch: {
      command: 'punch',
      help: '/punch <playername>: Punch a player.',
      run(data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'punch';

        return actionsObj.userCommands.interactUser.run(data, senderSocket);
      },
    },

    slap: {
      command: 'slap',
      help: '/slap <playername>: Slap a player for fun.',
      run(data, senderSocket) {
        const { args } = data;

        data.args[2] = data.args[1];
        data.args[1] = 'slap';

        return actionsObj.userCommands.interactUser.run(data, senderSocket);
      },
    },

    interactUser: {
      command: 'interactUser',
      help:
        '/interactUser <buzz/lick/pat/poke/punch/slap> <playername>: Interact with a player.',
      run(data, senderSocket) {
        const { args } = data;

        const possibleInteracts = ['buzz', 'lick', 'pat', 'poke', 'punch', 'slap'];
        if (possibleInteracts.indexOf(args[1]) === -1) {
          return {
            message: `You can only buzz, lick, pat, poke, punch, or slap; not ${args[1]}.`,
            classStr: 'server-text',
            dateCreated: new Date(),
          };
        }

        const slapSocket =
          allSockets[getIndexFromUsername(allSockets, args[2], true)];
        if (slapSocket) {
          let verbPast = '';
          if (args[1] === 'buzz') {
            verbPast = 'buzzed';
          } else if (args[1] === 'lick') {
            verbPast = 'licked';
          } else if (args[1] === 'pat') {
            verbPast = 'patted';
          } else if (args[1] === 'poke') {
            verbPast = 'poked';
          } else if (args[1] === 'punch') {
            verbPast = 'punched';
          } else if (args[1] === 'slap') {
            verbPast = 'slapped';
          }

          const dataToSend = {
            username: senderSocket.request.user.username,
            verb: args[1],
            verbPast,
          };
          slapSocket.emit('interactUser', dataToSend);

          // if the sendersocket is in a game, then send a message to everyone in the game.
          let slappedInGame = false;
          let socketThatWasSlappedInGame;
          // need to know which person is in the room, if theyre both then it doesnt matter who.
          if (
            senderSocket.request.user.inRoomId &&
            rooms[senderSocket.request.user.inRoomId] &&
            rooms[senderSocket.request.user.inRoomId].gameStarted === true
          ) {
            slappedInGame = true;
            socketThatWasSlappedInGame = senderSocket;
          } else if (
            slapSocket.request.user.inRoomId &&
            rooms[slapSocket.request.user.inRoomId] &&
            rooms[slapSocket.request.user.inRoomId].gameStarted === true
          ) {
            slappedInGame = true;
            socketThatWasSlappedInGame = slapSocket;
          }

          if (slappedInGame === true) {
            const str = `${senderSocket.request.user.username} has ${verbPast} ${slapSocket.request.user.username}. (In game)`;
            rooms[socketThatWasSlappedInGame.request.user.inRoomId].sendText(
              rooms[socketThatWasSlappedInGame.request.user.inRoomId]
                .allSockets,
              str,
              'server-text'
            );
          }

          // {message: "You have " + verbPast + " " + args[2] + "!", classStr: "server-text"};
        } else {
          // console.log(allSockets);
          return {
            message: 'There is no such player.',
            classStr: 'server-text',
          };
        }
      },
    },

    roomchat: {
      command: 'roomchat',
      help: '/roomchat: Get a copy of the chat for the current game.',
      run(data, senderSocket) {
        const { args } = data;
        // code
        if (
          rooms[senderSocket.request.user.inRoomId] &&
          rooms[senderSocket.request.user.inRoomId].gameStarted === true
        ) {
          return rooms[senderSocket.request.user.inRoomId].chatHistory;
        }

        return {
          message: "The game hasn't started yet. There is no chat to display.",
          classStr: 'server-text',
        };
      },
    },

    allchat: {
      command: 'allchat',
      help: '/allchat: Get a copy of the last 5 minutes of allchat.',
      run(data, senderSocket) {
        // code
        const { args } = data;
        return allChat5Min;
      },
    },

    roll: {
      command: 'roll',
      help:
        '/roll <optional number>: Returns a random number between 1 and 10 or 1 and optional number.',
      run(data, senderSocket) {
        const { args } = data;

        // code
        if (args[1]) {
          if (isNaN(args[1]) === false) {
            return {
              message: (Math.floor(Math.random() * args[1]) + 1).toString(),
              classStr: 'server-text',
            };
          }

          return {
            message: 'That is not a valid number!',
            classStr: 'server-text',
          };
        }
        return {
          message: (Math.floor(Math.random() * 10) + 1).toString(),
          classStr: 'server-text',
        };
      },
    },

    mods: {
      command: 'mods',
      help: '/mods: Shows a list of online moderators.',
      run() {
        const modUsers = getPlayerUsernamesFromAllSockets().filter((username) =>
          modsArray.includes(username.toLowerCase())
        );
        const message = `Currently online mods: ${
          modUsers.length > 0 ? modUsers.join(', ') : 'None'
        }.`;
        return { message, classStr: 'server-text' };
      },
    },

    pmmod: {
      command: 'pmmod',
      help:
        '/pmmod <mod_username> <message>: Sends a private message to an online moderator.',
      run(data, senderSocket) {
        const { args } = data;
        // We check if they are spamming, i.e. have sent a PM before the timeout is up
        const lastPmTime = pmmodCooldowns[senderSocket.id];
        if (lastPmTime) {
          const remaining = new Date() - lastPmTime;
          if (remaining < PMMOD_TIMEOUT)
            return {
              message: `Please wait ${Math.ceil(
                (PMMOD_TIMEOUT - remaining) / 1000
              )} seconds before sending another pm!`,
              classStr: 'server-text',
            };
        }
        // Checks for various missing fields or errors
        if (!args[1])
          return {
            message:
              'Please specify a mod to message. Type /mods to get a list of online mods.',
            classStr: 'server-text',
          };
        if (!args[2])
          return {
            message: 'Please specify a message to send.',
            classStr: 'server-text',
          };
        const modSocket =
          allSockets[getIndexFromUsername(allSockets, args[1], true)];
        if (!modSocket)
          return {
            message: `Could not find ${args[1]}.`,
            classStr: 'server-text',
          };
        if (modSocket.id === senderSocket.id)
          return {
            message: 'You cannot private message yourself!',
            classStr: 'server-text',
          };
        if (!modsArray.includes(args[1].toLowerCase()))
          return {
            message: `${args[1]} is not a mod. You may not private message them.`,
            classStr: 'server-text',
          };

        let str = `${senderSocket.request.user.username}->${
          modSocket.request.user.username
        } (pmmod): ${args.slice(2).join(' ')}`;

        const dataMessage = {
          message: str,
          dateCreated: new Date(),
          classStr: 'whisper',
        };

        senderSocket.emit('allChatToClient', dataMessage);
        senderSocket.emit('roomChatToClient', dataMessage);

        modSocket.emit('allChatToClient', dataMessage);
        modSocket.emit('roomChatToClient', dataMessage);

        // Set a cooldown for the sender until they can send another pm
        pmmodCooldowns[senderSocket.id] = new Date();

        // Create the mod log.
        mlog = ModLog.create({
          type: 'pmmod',
          modWhoMade: {
            id: modSocket.request.user.id,
            username: modSocket.request.user.username,
            usernameLower: modSocket.request.user.usernameLower,
          },
          data: {
            targetUser: {
              id: senderSocket.request.user.id,
              username: senderSocket.request.user.username,
              usernameLower: senderSocket.request.user.usernameLower,
            },
            message: dataMessage.message,
          },
          dateCreated: new Date(),
        });
      },
    },

    mute: {
      command: 'mute',
      help:
        '/mute: Mute a player who is being annoying in chat/buzzing/slapping/licking/poking/tickling you.',
      run(data, senderSocket) {
        const { args } = data;

        if (args[1]) {
          User.findOne({ username: args[1] }).exec((err, foundUserToMute) => {
            if (err) {
              console.log(err);
            } else if (foundUserToMute) {
              User.findOne({
                username: senderSocket.request.user.username,
              }).exec((err, userCallingMute) => {
                if (err) {
                  console.log(err);
                } else if (userCallingMute) {
                  if (!userCallingMute.mutedPlayers) {
                    userCallingMute.mutedPlayers = [];
                  }
                  if (
                    userCallingMute.mutedPlayers.indexOf(
                      foundUserToMute.username
                    ) === -1
                  ) {
                    userCallingMute.mutedPlayers.push(foundUserToMute.username);
                    userCallingMute.markModified('mutedPlayers');
                    userCallingMute.save();
                    senderSocket.emit(
                      'updateMutedPlayers',
                      userCallingMute.mutedPlayers
                    );
                    senderSocket.emit('messageCommandReturnStr', {
                      message: `Muted ${args[1]} successfully.`,
                      classStr: 'server-text',
                    });
                  } else {
                    senderSocket.emit('messageCommandReturnStr', {
                      message: `You have already muted ${args[1]}.`,
                      classStr: 'server-text',
                    });
                  }
                }
              });
            } else {
              senderSocket.emit('messageCommandReturnStr', {
                message: `${args[1]} was not found.`,
                classStr: 'server-text',
              });
            }
          });
        }
      },
    },

    unmute: {
      command: 'unmute',
      help: '/unmute: Unmute a player.',
      run(data, senderSocket) {
        const { args } = data;

        if (args[1]) {
          User.findOne({ username: senderSocket.request.user.username }).exec(
            (err, foundUser) => {
              if (err) {
                console.log(err);
              } else if (foundUser) {
                if (!foundUser.mutedPlayers) {
                  foundUser.mutedPlayers = [];
                }
                const index = foundUser.mutedPlayers.indexOf(args[1]);

                if (index !== -1) {
                  foundUser.mutedPlayers.splice(index, 1);
                  foundUser.markModified('mutedPlayers');
                  foundUser.save();

                  senderSocket.emit(
                    'updateMutedPlayers',
                    foundUser.mutedPlayers
                  );
                  senderSocket.emit('messageCommandReturnStr', {
                    message: `Unmuted ${args[1]} successfully.`,
                    classStr: 'server-text',
                  });
                } else {
                  senderSocket.emit('messageCommandReturnStr', {
                    message: `Could not find ${args[1]}.`,
                    classStr: 'server-text',
                  });
                }
              }
            }
          );
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `${args[1]} was not found or was not muted from the start.`,
            classStr: 'server-text',
          });
        }
      },
    },

    getmutedplayers: {
      command: 'getmutedplayers',
      help: '/getmutedplayers: See who you have muted.',
      run(data, senderSocket) {
        const { args } = data;

        if (args[1] === senderSocket.request.user.username) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Why would you mute yourself...?',
            classStr: 'server-text',
          });
          return;
        }

        User.findOne({ username: senderSocket.request.user.username }).exec(
          (err, foundUser) => {
            if (err) {
              console.log(err);
            } else if (foundUser) {
              if (!foundUser.mutedPlayers) {
                foundUser.mutedPlayers = [];
              }

              const dataToReturn = [];
              dataToReturn[0] = {
                message: 'Muted players:',
                classStr: 'server-text',
              };

              for (let i = 0; i < foundUser.mutedPlayers.length; i++) {
                dataToReturn[i + 1] = {
                  message: `-${foundUser.mutedPlayers[i]}`,
                  classStr: 'server-text',
                };
              }
              if (dataToReturn.length === 1) {
                dataToReturn[0] = {
                  message: 'You have no muted players.',
                  classStr: 'server-text',
                };
              }

              // console.log(dataToReturn);

              senderSocket.emit('messageCommandReturnStr', dataToReturn);
            }
          }
        );
      },
    },

    navbar: {
      command: 'navbar',
      help:
        '/navbar: Hides and unhides the top navbar. Some phone screens may look better with the navbar turned off.',
      run(data, senderSocket) {
        const { args } = data;
        senderSocket.emit('toggleNavBar');
      },
    },

    avatarshow: {
      command: 'avatarshow',
      help: '/avatarshow: Show your custom avatar!',
      run(data, senderSocket) {
        User.findOne({
          usernameLower: senderSocket.request.user.username.toLowerCase(),
        })
          .populate('notifications')
          .exec((err, foundUser) => {
            foundUser.avatarHide = false;
            foundUser.save();

            const dataToReturn = {
              message: 'Successfully unhidden.',
              classStr: 'server-text',
            };

            senderSocket.emit('messageCommandReturnStr', dataToReturn);
          });
      },
    },
    avatarhide: {
      command: 'avatarhide',
      help: '/avatarhide: Hide your custom avatar.',
      run(data, senderSocket) {
        User.findOne({
          usernameLower: senderSocket.request.user.username.toLowerCase(),
        })
          .populate('notifications')
          .exec((err, foundUser) => {
            foundUser.avatarHide = true;
            foundUser.save();

            const dataToReturn = {
              message: 'Successfully hidden.',
              classStr: 'server-text',
            };

            senderSocket.emit('messageCommandReturnStr', dataToReturn);
          });
      },
    },
    r: {
      command: 'r',
      help: '/r: Reply to a mod who just messaged you.',
      run(data, senderSocket) {
        const { args } = data;

        // If the player has not been whispered to yet.
        if (!lastWhisperObj[senderSocket.request.user.username.toLowerCase()]) {
          return {
            message: "You haven't been whispered to before.",
            classStr: 'server-text',
          };
        }
        const sendToSocket =
          allSockets[
            getIndexFromUsername(
              allSockets,
              lastWhisperObj[senderSocket.request.user.username.toLowerCase()]
                .username,
              true
            )
          ];
        if (sendToSocket === undefined || sendToSocket === null) {
          return;
        }
        // this sendToSocket is the moderator
        // If the reply target is no longer in the sockets list.
        if (!sendToSocket) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Your target has disconnected.',
            classStr: 'server-text',
          });
        } else {
          let str = `${senderSocket.request.user.username}->${sendToSocket.request.user.username} (whisper): `;
          for (let i = 1; i < args.length; i++) {
            str += args[i];
            str += ' ';
          }

          // str += ("(From: " + senderSocket.request.user.username + ")");

          const dataMessage = {
            message: str,
            dateCreated: new Date(),
            classStr: 'whisper',
          };

          sendToSocket.emit('allChatToClient', dataMessage);
          sendToSocket.emit('roomChatToClient', dataMessage);

          senderSocket.emit('allChatToClient', dataMessage);
          senderSocket.emit('roomChatToClient', dataMessage);

          modlog =
            lastWhisperObj[senderSocket.request.user.username.toLowerCase()]
              .modlog;
          modlog.data.log.push(dataMessage);
          modlog.markModified('data');
          modlog.save();
        }
      },
    },
    guessmerlin: {
      command: 'guessmerlin',
      help:
        '/guessmerlin <playername>: Solely for fun, submit your guess of who you think is Merlin.',
      run(data, senderSocket) {
        // Check the guesser is at a table
        if (
          senderSocket.request.user.inRoomId === undefined ||
          rooms[senderSocket.request.user.inRoomId].gameStarted !== true ||
          rooms[senderSocket.request.user.inRoomId].phase === 'finished'
        ) {
          messageToClient = 'You must be at a running table to guess Merlin.';
        } else {
          messageToClient = rooms[
            senderSocket.request.user.inRoomId
          ].submitMerlinGuess(senderSocket.request.user.username, data.args[1]);
        }

        return { message: messageToClient, classStr: 'server-text noselect' };
      },
    },
    gm: {
      command: 'gm',
      help: '/gm <playername>: Shortcut for /guessmerlin',
      run(data, senderSocket) {
        return actionsObj.userCommands.guessmerlin.run(data, senderSocket);
      },
    },

    getbots: {
      command: 'getbots',
      help:
        '/getbots: Run this in a bot-compatible room. Prints a list of available bots to add, as well as their supported game modes',
      run(data, senderSocket) {
        // if (senderSocket.request.user.inRoomId === undefined) {
        // 	return {
        // 		message: "You must be in a bot-capable room to run this command!",
        // 		classStr: "server-text"
        // 	};
        // } else if (rooms[senderSocket.request.user.inRoomId].gameMode !== 'avalonBot') {
        // 	return {
        // 		message: "This room is not bot capable. Please join a bot-capable room.",
        // 		classStr: "server-text"
        // 	}
        // }

        senderSocket.emit('messageCommandReturnStr', {
          message: 'Fetching bots...',
          classStr: 'server-text',
        });

        const botInfoRequests = enabledBots.map((botAPI) =>
          makeBotAPIRequest(botAPI, 'GET', '/v0/info', {}, 2000)
            .then((response) => {
              if (response.status !== 200) {
                return null;
              }
              return {
                name: botAPI.name,
                info: response.data,
              };
            })
            .catch((response) => null)
        );

        axios.all(botInfoRequests).then((botInfoResponses) => {
          const botDescriptions = botInfoResponses
            .filter((result) => result != null)
            .map(
              (result) =>
                `${result.name} - ${JSON.stringify(result.info.capabilities)}`
            );

          // Hard code this in... (unshift pushes to the start of the array)
          botDescriptions.unshift('SimpleBot - Random playing bot...');

          if (botDescriptions.length === 0) {
            senderSocket.emit('messageCommandReturnStr', {
              message: 'No bots are currently available.',
              classStr: 'server-text',
            });
          } else {
            const messages = ['The following bots are online:'].concat(
              botDescriptions
            );
            senderSocket.emit(
              'messageCommandReturnStr',
              messages.map((message) => ({
                message,
                classStr: 'server-text',
              }))
            );
          }
        });
      },
    },

    addbot: {
      command: 'addbot',
      help:
        '/addbot <name> [number]: Run this in a bot-compatible room. Add a bot to the room.',
      run(data, senderSocket) {
        if (
          senderSocket.request.user.inRoomId === undefined ||
          rooms[senderSocket.request.user.inRoomId] === undefined
        ) {
          return {
            message: 'You must be in a bot-capable room to run this command!',
            classStr: 'server-text',
          };
        }
        if (
          rooms[senderSocket.request.user.inRoomId].gameMode
            .toLowerCase()
            .includes('bot') === false
        ) {
          return {
            message:
              'This room is not bot capable. Please join a bot-capable room.',
            classStr: 'server-text',
          };
        }
        if (
          rooms[senderSocket.request.user.inRoomId].host !==
          senderSocket.request.user.username
        ) {
          return {
            message: 'You are not the host.',
            classStr: 'server-text',
          };
        }

        const currentRoomId = senderSocket.request.user.inRoomId;
        const currentRoom = rooms[currentRoomId];

        if (currentRoom.gameStarted === true || currentRoom.canJoin === false) {
          return {
            message: 'No bots can join this room at this time.',
            classStr: 'server-text',
          };
        }

        const { args } = data;

        if (!args[1]) {
          return {
            message: 'Specify a bot. Use /getbots to see online bots.',
            classStr: 'server-text',
          };
        }
        var botName = args[1];
        const botAPI = enabledBots.find(
          (bot) => bot.name.toLowerCase() === botName.toLowerCase()
        );
        if (!botAPI && botName !== 'SimpleBot') {
          return {
            message: `Couldn't find a bot called ${botName}.`,
            classStr: 'server-text',
          };
        }

        const numBots = +args[2] || 1;

        if (
          currentRoom.socketsOfPlayers.length + numBots >
          currentRoom.maxNumPlayers
        ) {
          return {
            message: `Adding ${numBots} bot(s) would make this room too full.`,
            classStr: 'server-text',
          };
        }

        const addedBots = [];
        for (let i = 0; i < numBots; i++) {
          var botName = `${botAPI.name}#${Math.floor(Math.random() * 100)}`;

          // Avoid a username clash!
          const currentUsernames = currentRoom.socketsOfPlayers.map(
            (sock) => sock.request.user.username
          );
          if (currentUsernames.includes(botName)) {
            i--;
            continue;
          }

          var dummySocket;
          if (botAPI.name == 'SimpleBot') {
            dummySocket = new SimpleBotSocket(botName);
          } else {
            dummySocket = new APIBotSocket(botName, botAPI);
          }

          currentRoom.playerJoinRoom(dummySocket);
          currentRoom.playerSitDown(dummySocket);
          if (!currentRoom.botSockets) {
            currentRoom.botSockets = [];
          }
          currentRoom.botSockets.push(dummySocket);
          addedBots.push(botName);
        }

        if (addedBots.length > 0) {
          sendToRoomChat(ioGlobal, currentRoomId, {
            message: `${
              senderSocket.request.user.username
            } added bots to this room: ${addedBots.join(', ')}`,
            classStr: 'server-text-teal',
          });
        }
      },
    },
    rembot: {
      command: 'rembot',
      help:
        '/rembot (<name>|all): Run this in a bot-compatible room. Removes a bot from the room.',
      run(data, senderSocket) {
        if (
          senderSocket.request.user.inRoomId === undefined ||
          rooms[senderSocket.request.user.inRoomId] === undefined
        ) {
          return {
            message: 'You must be in a bot-capable room to run this command!',
            classStr: 'server-text',
          };
        }
        if (
          rooms[senderSocket.request.user.inRoomId].gameMode
            .toLowerCase()
            .includes('bot') === false
        ) {
          return {
            message:
              'This room is not bot capable. Please join a bot-capable room.',
            classStr: 'server-text',
          };
        }
        if (
          rooms[senderSocket.request.user.inRoomId].host !==
          senderSocket.request.user.username
        ) {
          return {
            message: 'You are not the host.',
            classStr: 'server-text',
          };
        }

        const currentRoomId = senderSocket.request.user.inRoomId;
        const currentRoom = rooms[currentRoomId];
        const { args } = data;

        if (currentRoom.gameStarted === true || currentRoom.canJoin === false) {
          return {
            message: 'No bots can be removed from this room at this time.',
            classStr: 'server-text',
          };
        }

        if (!args[1]) {
          return {
            message:
              'Specify a bot to remove, or use "/rembot all" to remove all bots.',
            classStr: 'server-text',
          };
        }
        const botName = args[1];
        const botSockets = currentRoom.botSockets.slice() || [];
        const botsToRemove =
          botName === 'all'
            ? botSockets
            : botSockets.filter(
                (socket) =>
                  socket.request.user.username.toLowerCase() ===
                  botName.toLowerCase()
              );
        if (botsToRemove.length === 0) {
          return {
            message: "Couldn't find any bots with that name to remove.",
            classStr: 'server-text',
          };
        }

        botsToRemove.forEach((botSocket) => {
          currentRoom.playerLeaveRoom(botSocket);

          if (
            currentRoom.botSockets &&
            currentRoom.botSockets.indexOf(botSocket) !== -1
          ) {
            currentRoom.botSockets.splice(
              currentRoom.botSockets.indexOf(botSocket),
              1
            );
          }
        });

        const removedBots = botsToRemove.map(
          (botSocket) => botSocket.request.user.username
        );
        sendToRoomChat(ioGlobal, currentRoomId, {
          message: `${
            senderSocket.request.user.username
          } removed bots from this room: ${removedBots.join(', ')}`,
          classStr: 'server-text-teal',
        });
      },
    },
  },

  modCommands: {
    m: {
      command: 'm',
      help: '/m: displays /mhelp',
      run(data, senderSocket) {
        return actionsObj.modCommands.mhelp.run(data, senderSocket);
      },
    },
    mban: {
      command: 'mban',
      help: '/mban: Open the ban interface',
      run(data, senderSocket) {
        // console.log(senderSocket.request.user.username);
        if (
          modsArray.indexOf(
            senderSocket.request.user.username.toLowerCase()
          ) !== -1
        ) {
          senderSocket.emit('openModModal');
          return {
            message: 'May your judgement bring peace to all!',
            classStr: 'server-text',
          };
        }

        // add a report to this player.
        return {
          message: 'You are not a mod. Why are you trying this...',
          classStr: 'server-text',
        };
      },
    },
    mhelp: {
      command: 'mhelp',
      help: '/mhelp: show commands.',
      run(data, senderSocket) {
        const { args } = data;
        // do stuff
        const dataToReturn = [];
        let i = 0;
        i++;

        for (const key in actionsObj.modCommands) {
          if (actionsObj.modCommands.hasOwnProperty(key)) {
            if (!actionsObj.modCommands[key].modsOnly) {
              // console.log(key + " -> " + p[key]);
              dataToReturn[i] = {
                message: actionsObj.modCommands[key].help,
                classStr: 'server-text',
              };
              // str[i] = userCommands[key].help;
              i++;
              // create a break in the chat
              // data[i] = {message: "-------------------------", classStr: "server-text"};
              // i++;
            }
          }
        }
        return dataToReturn;
      },
    },

    mgetban: {
      command: 'mgetban',
      help:
        '/mgetban <username>: Find the players latest active ban that would be undone by /munban.',
      async run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
          return { message: 'Specify a username.', classStr: 'server-text' };
        }

        ban = await Ban.findOne({
          'bannedPlayer.usernameLower': args[1].toLowerCase(),
          whenRelease: { $gt: new Date() },
          disabled: false,
        }).sort({ whenMade: 'descending' });

        if (ban) {
          const dataToReturn = [];
          dataToReturn[0] = {
            message: `Ban details for ${ban.bannedPlayer.username}:`,
            classStr: 'server-text',
            dateCreated: new Date(),
          };

          dataToReturn.push({
            message: `Ban made by: ${ban.modWhoBanned.username}`,
            classStr: 'server-text',
            dateCreated: new Date(),
          });
          dataToReturn.push({
            message: `Ban made on: ${moment(ban.whenMade).format('LLL')}.`,
            classStr: 'server-text',
            dateCreated: new Date(),
          });
          dataToReturn.push({
            message: `Ban duration: ${ban.durationToBan}`,
            classStr: 'server-text',
            dateCreated: new Date(),
          });
          dataToReturn.push({
            message: `Ban to be released on: ${moment(ban.whenRelease).format(
              'LLL'
            )}.`,
            classStr: 'server-text',
            dateCreated: new Date(),
          });
          dataToReturn.push({
            message: `Mod description: ${ban.descriptionByMod}`,
            classStr: 'server-text',
            dateCreated: new Date(),
          });
          dataToReturn.push({
            message: `User ban: ${ban.userBan}`,
            classStr: 'server-text',
            dateCreated: new Date(),
          });
          dataToReturn.push({
            message: `IP ban: ${ban.ipBan}`,
            classStr: 'server-text',
            dateCreated: new Date(),
          });
          dataToReturn.push({
            message: `Single IP ban: ${ban.singleIPBan}`,
            classStr: 'server-text',
            dateCreated: new Date(),
          });

          senderSocket.emit('messageCommandReturnStr', dataToReturn);
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find an active ban for ${args[1]}.`,
            classStr: 'server-text',
          });
        }
      },
    },

    munban: {
      command: 'munban',
      help: '/munban <username>: Removes the latest ban for a username.',
      async run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
          return { message: 'Specify a username.', classStr: 'server-text' };
        }

        ban = await Ban.findOne({
          'bannedPlayer.usernameLower': args[1].toLowerCase(),
          whenRelease: { $gt: new Date() },
          disabled: false,
        }).sort({ whenMade: 'descending' });

        if (ban) {
          ban.disabled = true;
          ban.markModified('disabled');
          await ban.save();

          // Create the ModLog
          const modUser = await User.findOne({
            usernameLower: senderSocket.request.user.username.toLowerCase(),
          });
          ModLog.create({
            type: 'munban',
            modWhoMade: {
              id: modUser._id,
              username: modUser.username,
              usernameLower: modUser.usernameLower,
            },
            data: ban,
            dateCreated: new Date(),
          });
          senderSocket.emit('messageCommandReturnStr', {
            message: `Successfully unbanned ${args[1]}'s latest ban. Their record still remains, however.`,
            classStr: 'server-text',
          });
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find a ban for ${args[1]}.`,
            classStr: 'server-text',
          });
        }
      },
    },

    mcompareips: {
      command: 'mcompareips',
      help: '/mcompareips: Get usernames of players with the same IP.',
      async run(data, senderSocket) {
        const usernames = [];
        const ips = [];

        for (var i = 0; i < allSockets.length; i++) {
          usernames.push(allSockets[i].request.user.username);

          const clientIpAddress =
            allSockets[i].request.headers['x-forwarded-for'] ||
            allSockets[i].request.connection.remoteAddress;
          ips.push(clientIpAddress);
        }

        const uniq = ips
          .map((ip) => ({ count: 1, ip }))
          .reduce((a, b) => {
            a[b.ip] = (a[b.ip] || 0) + b.count;
            return a;
          }, {});

        const duplicateIps = Object.keys(uniq).filter((a) => uniq[a] > 1);

        const dataToReturn = [];

        if (duplicateIps.length === 0) {
          dataToReturn[0] = {
            message: 'There are no users with matching IPs.',
            classStr: 'server-text',
            dateCreated: new Date(),
          };
        } else {
          dataToReturn[0] = {
            message: '-------------------------',
            classStr: 'server-text',
            dateCreated: new Date(),
          };

          for (var i = 0; i < duplicateIps.length; i++) {
            // for each ip, search through the whole users to see who has the ips

            for (let j = 0; j < ips.length; j++) {
              if (ips[j] === duplicateIps[i]) {
                dataToReturn.push({
                  message: usernames[j],
                  classStr: 'server-text',
                  dateCreated: new Date(),
                });
              }
            }
            dataToReturn.push({
              message: '-------------------------',
              classStr: 'server-text',
              dateCreated: new Date(),
            });
          }
        }
        senderSocket.emit('messageCommandReturnStr', dataToReturn);
      },
    },
    mdc: {
      command: 'mdc',
      help: '/mdc <player name>: Disconnect a player.',
      async run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Specify a username.',
            classStr: 'server-text',
          });
          return;
        }

        const targetSock =
          allSockets[getIndexFromUsername(allSockets, args[1], true)];
        if (targetSock) {
          targetSock.emit('redirect', '/logout');
          targetSock.disconnect();
          senderSocket.emit('messageCommandReturnStr', {
            message: `Disconnected ${args[1]} successfully.`,
            classStr: 'server-text',
          });
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Could not find username',
            classStr: 'server-text',
          });
        }
      },
    },

    mnotify: {
      command: 'mnotify',
      help:
        '/mnotify <player name> <text to leave for player>: Leaves a message for a player that will appear in their notifications. Note your name will be added to the end of the message to them.',
      async run(data, senderSocket) {
        const { args } = data;
        let str = '';
        for (let i = 2; i < args.length; i++) {
          str += args[i];
          str += ' ';
        }

        str += `(From: ${senderSocket.request.user.username})`;

        User.findOne({ usernameLower: args[1].toLowerCase() }).exec(
          (err, foundUser) => {
            if (err) {
              console.log(err);
              senderSocket.emit('messageCommandReturnStr', {
                message: 'Server error... let me know if you see this.',
                classStr: 'server-text',
              });
            } else if (foundUser) {
              const userIdTarget = foundUser._id;
              const stringToSay = str;
              const link = '#';

              createNotificationObj.createNotification(
                userIdTarget,
                stringToSay,
                link,
                senderSocket.request.user.username
              );

              ModLog.create({
                type: 'mnotify',
                modWhoMade: {
                  id: senderSocket.request.user.id,
                  username: senderSocket.request.user.username,
                  usernameLower: senderSocket.request.user.usernameLower,
                },
                data: {
                  targetUser: {
                    id: foundUser._id,
                    username: foundUser.username,
                    usernameLower: foundUser.usernameLower,
                  },
                  message: stringToSay,
                },
                dateCreated: new Date(),
              });

              senderSocket.emit('messageCommandReturnStr', {
                message: `Sent to ${foundUser.username} successfully! Here was your message: ${str}`,
                classStr: 'server-text',
              });
            } else {
              senderSocket.emit('messageCommandReturnStr', {
                message: `Could not find ${args[1]}`,
                classStr: 'server-text',
              });
            }
          }
        );
      },
    },

    mwhisper: {
      command: 'mwhisper',
      help:
        '/mwhisper <player name> <text to send>: Sends a whisper to a player.',
      async run(data, senderSocket) {
        const { args } = data;

        if (
          args[1].toLowerCase() ===
          senderSocket.request.user.username.toLowerCase()
        ) {
          senderSocket.emit('messageCommandReturnStr', {
            message: `You cannot whisper yourself...`,
            classStr: 'server-text',
          });
        }

        const sendToSocket =
          allSockets[getIndexFromUsername(allSockets, args[1], true)];

        if (!sendToSocket) {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find ${args[1]}.`,
            classStr: 'server-text',
          });
        } else {
          let str = `${senderSocket.request.user.username}->${sendToSocket.request.user.username} (whisper): `;
          for (let i = 2; i < args.length; i++) {
            str += args[i];
            str += ' ';
          }

          const dataMessage = {
            message: str,
            dateCreated: new Date(),
            classStr: 'whisper',
          };

          // send notification that you can do /r for first whisper message
          if (
            !lastWhisperObj[sendToSocket.request.user.username.toLowerCase()]
          ) {
            sendToSocket.emit('allChatToClient', {
              message: 'You can do /r <message> to reply.',
              classStr: 'whisper',
              dateCreated: new Date(),
            });
            sendToSocket.emit('roomChatToClient', {
              message: 'You can do /r <message> to reply.',
              classStr: 'whisper',
              dateCreated: new Date(),
            });
          }

          sendToSocket.emit('allChatToClient', dataMessage);
          sendToSocket.emit('roomChatToClient', dataMessage);

          senderSocket.emit('allChatToClient', dataMessage);
          senderSocket.emit('roomChatToClient', dataMessage);

          mlog = await ModLog.create({
            type: 'mwhisper',
            modWhoMade: {
              id: senderSocket.request.user.id,
              username: senderSocket.request.user.username,
              usernameLower: senderSocket.request.user.usernameLower,
            },
            data: {
              targetUser: {
                id: sendToSocket.request.user.id,
                username: sendToSocket.request.user.username,
                usernameLower: sendToSocket.request.user.usernameLower,
              },
              log: [dataMessage],
            },
            dateCreated: new Date(),
          });

          // set the last whisper person
          lastWhisperObj[sendToSocket.request.user.username.toLowerCase()] = {
            username: senderSocket.request.user.username.toLowerCase(),
            modlog: mlog,
          };

          lastWhisperObj[senderSocket.request.user.username.toLowerCase()] = {
            username: sendToSocket.request.user.username.toLowerCase(),
            modlog: mlog,
          };
        }
      },
    },

    mremoveavatar: {
      command: 'mremoveavatar',
      help: "/mremoveavatar <player name>: Remove <player name>'s avatar.",
      async run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Specify a username.',
            classStr: 'server-text',
          });
          return;
        }

        User.findOne({ usernameLower: args[1].toLowerCase() })
          .populate('notifications')
          .exec((err, foundUser) => {
            if (err) {
              console.log(err);
            } else if (foundUser !== undefined) {
              foundUser.avatarImgRes = null;
              foundUser.avatarImgSpy = null;
              foundUser.save();

              senderSocket.emit('messageCommandReturnStr', {
                message: `Successfully removed ${args[1]}'s avatar.`,
                classStr: 'server-text',
              });
            } else {
              senderSocket.emit('messageCommandReturnStr', {
                message: `Could not find ${args[1]}'s avatar. If you think this is a problem, contact admin.`,
                classStr: 'server-text',
              });
            }
          });
      },
    },

    maddbots: {
      command: 'maddbots',
      help: '/maddbots <number>: Add <number> bots to the room.',
      run(data, senderSocket, roomIdInput) {
        const { args } = data;

        if (!args[1]) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Specify a number.',
            classStr: 'server-text',
          });
          return;
        }

        let roomId;
        if (senderSocket === undefined) {
          roomId = roomIdInput;
        } else {
          roomId = senderSocket.request.user.inRoomId;
        }

        if (rooms[roomId]) {
          const dummySockets = [];

          for (let i = 0; i < args[1]; i++) {
            const botName = `${'SimpleBot' + '#'}${Math.floor(
              Math.random() * 100
            )}`;

            // Avoid a username clash!
            const currentUsernames = rooms[roomId].socketsOfPlayers.map(
              (sock) => sock.request.user.username
            );
            if (currentUsernames.includes(botName)) {
              i--;
              continue;
            }

            dummySockets[i] = new SimpleBotSocket(botName);
            rooms[roomId].playerJoinRoom(dummySockets[i]);
            rooms[roomId].playerSitDown(dummySockets[i]);

            // Save a copy of the sockets within botSockets
            if (!rooms[roomId].botSockets) {
              rooms[roomId].botSockets = [];
            }
            rooms[roomId].botSockets.push(dummySockets[i]);
          }
        }
      },
    },

    mtestgame: {
      command: 'mtestgame',
      help:
        '/mtestgame <number>: Add <number> bots to a test game and start it automatically.',
      run(data, senderSocket, io) {
        const { args } = data;

        if (!args[1]) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Specify a number.',
            classStr: 'server-text',
          });
          return;
        }

        if (parseInt(args[1]) > 10 || parseInt(args[1]) < 1) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Specify a number between 1 and 10.',
            classStr: 'server-text',
          });
          return;
        }

        // Get the next room Id
        while (rooms[nextRoomId]) {
          nextRoomId++;
        }
        dataObj = {
          maxNumPlayers: 10,
          newRoomPassword: '',
          gameMode: 'avalonBot',
        };

        // Create the room
        rooms[nextRoomId] = new gameRoom(
          'Bot game',
          nextRoomId,
          io,
          dataObj.maxNumPlayers,
          dataObj.newRoomPassword,
          dataObj.gameMode,
          false,
          socketCallback
        );
        const privateStr = dataObj.newRoomPassword === '' ? '' : 'private ';
        // broadcast to all chat
        const messageData = {
          message: `${
            'Bot game' + ' has created '
          }${privateStr}room ${nextRoomId}.`,
          classStr: 'server-text',
        };
        sendToAllChat(io, messageData);

        // Add the bots to the room
        actionsObj.modCommands.maddbots.run(data, undefined, nextRoomId);

        // Start the game.
        const options = [
          'Merlin',
          'Assassin',
          'Percival',
          'Morgana',
          'Ref of the Rain',
          'Sire of the Sea',
          'Lady of the Lake',
        ];
        rooms[nextRoomId].hostTryStartGame(options, 'avalonBot');
      },
    },

    mremovefrozen: {
      command: 'mremovefrozen',
      help:
        '/mremovefrozen: Remove all frozen rooms and the corresponding save files in the database.',
      run(data, senderSocket) {
        for (let i = 0; i < rooms.length; i++) {
          if (rooms[i] && rooms[i].frozen === true) {
            destroyRoom(rooms[i].roomId);
          }
        }
        updateCurrentGamesList();
      },
    },

    mclose: {
      command: 'mclose',
      help:
        '/mclose <roomId> [<roomId> <roomId> ...]: Close room <roomId>. Also removes the corresponding save files in the database. Can take multiple room IDs.',
      run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Specify a number.',
            classStr: 'server-text',
          });
          return;
        }

        const roomIdsToClose = args.splice(1);
        // console.log(roomIdsToClose);

        roomIdsToClose.forEach((idToClose) => {
          if (rooms[idToClose] !== undefined) {
            // Disconnect everyone
            for (let i = 0; i < rooms[idToClose].allSockets.length; i++) {
              rooms[idToClose].allSockets[i].emit('leave-room-requested');
            }

            // Stop bots thread if they are playing:
            if (rooms[idToClose].interval) {
              clearInterval(rooms[idToClose].interval);
              rooms[idToClose].interval = undefined;
            }

            // Forcefully close room
            if (rooms[idToClose]) {
              destroyRoom(rooms[idToClose].roomId);
            }
            senderSocket.emit('messageCommandReturnStr', {
              message: `Closed room ${idToClose}.`,
              classStr: 'server-text',
            });
          } else {
            senderSocket.emit('messageCommandReturnStr', {
              message: `Could not close room ${idToClose}.`,
              classStr: 'server-text',
            });
          }
        });

        updateCurrentGamesList();
      },
    },
    mannounce: {
      command: 'mannounce',
      help:
        '/mannounce <message>: Sends a sweet alert to all online players with an included message. It automatically says the username of the mod that executed the command.',
      run(data, senderSocket) {
        const { args } = data;
        if (!args[1]) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Please enter a message...',
            classStr: 'server-text',
          });
          return;
        }

        let str = '';
        for (let i = 1; i < args.length; i++) {
          str += args[i];
          str += ' ';
        }

        str += `<br><br>From: ${senderSocket.request.user.username}`;

        allSockets.forEach((sock) => {
          sock.emit('mannounce', str);
        });
      },
    },

    mforcemove: {
      command: 'mforcemove',
      help:
        "/mforcemove <username> [button] [target]: Forces a player to make a move. To see what moves are available, enter the target's username. To force the move, input button and/or target.",
      run(data, senderSocket) {
        const { args } = data;

        senderSocket.emit('messageCommandReturnStr', {
          message: `You have entered: ${args.join(' ')}`,
          classStr: 'server-text',
        });

        let username = args[1];
        const button = args[2];
        const targets = args.splice(3);

        const thisRoom = rooms[senderSocket.request.user.inRoomId];

        if (thisRoom === undefined) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Please enter a room to use this command.',
            classStr: 'server-text',
          });
          return;
        }

        if (thisRoom.gameStarted === false) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'The game has not started.',
            classStr: 'server-text',
          });
          return;
        }

        if (args.length <= 1) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Please enter valid arguments.',
            classStr: 'server-text',
          });
          return;
        }

        const playerIndex = getIndexFromUsername(
          thisRoom.playersInGame,
          username,
          true
        );

        if (playerIndex === undefined) {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find player ${username}.`,
            classStr: 'server-text',
          });
          return;
        }

        // Update username to be the correct case.
        username = thisRoom.playersInGame[playerIndex].request.user.username;

        // If we have a username only:
        if (args.length === 2 || button === '') {
          const buttons = thisRoom.getClientButtonSettings(playerIndex);
          const numOfTargets = thisRoom.getClientNumOfTargets(playerIndex);
          const prohibitedIndexesToPick =
            thisRoom.getProhibitedIndexesToPick(playerIndex) || [];

          const availableButtons = [];
          if (buttons.green.hidden !== true) {
            availableButtons.push('yes');
          }
          const onMissionAndResistance =
            thisRoom.phase == 'votingMission' &&
            thisRoom.playersInGame[playerIndex].alliance === 'Resistance';
          // Add a special case so resistance can't fail missions.
          if (buttons.red.hidden !== true && onMissionAndResistance === false) {
            availableButtons.push('no');
          }

          var availablePlayers = thisRoom.playersInGame
            .filter(
              (player, playerIndex) =>
                prohibitedIndexesToPick.indexOf(playerIndex) === -1
            )
            .map((player) => player.request.user.username);

          // If there are 0 number of targets, there are no available players.
          if (numOfTargets === null) {
            var availablePlayers = null; // null here so that the user can see this. For other operations, set to [].
          }

          if (availableButtons.length !== 0) {
            senderSocket.emit('messageCommandReturnStr', {
              message: '---------------',
              classStr: 'server-text',
            });
            senderSocket.emit('messageCommandReturnStr', {
              message: `Player ${username} can make the following moves:`,
              classStr: 'server-text',
            });
            senderSocket.emit('messageCommandReturnStr', {
              message: `Buttons: ${availableButtons}.`,
              classStr: 'server-text',
            });
            senderSocket.emit('messageCommandReturnStr', {
              message: `Targets: ${availablePlayers}.`,
              classStr: 'server-text',
            });
            senderSocket.emit('messageCommandReturnStr', {
              message: `Number of targets: ${numOfTargets}.`,
              classStr: 'server-text',
            });
            senderSocket.emit('messageCommandReturnStr', {
              message: '---------------',
              classStr: 'server-text',
            });
          } else {
            senderSocket.emit('messageCommandReturnStr', {
              message: `Player ${username} cannot make any moves.`,
              classStr: 'server-text',
            });
          }
        }

        // User is trying to force move.
        else {
          // Raise the caps for target usernames
          targetsCaps = [];
          for (let i = 0; i < targets.length; i++) {
            const playerIndexFound = getIndexFromUsername(
              thisRoom.playersInGame,
              targets[i],
              true
            );
            const playerSimulatedSocket =
              thisRoom.playersInGame[playerIndexFound];
            if (playerSimulatedSocket === undefined) {
              senderSocket.emit('messageCommandReturnStr', {
                message: `Could not find player ${targets[i]}.`,
                classStr: 'server-text',
              });
              return;
            }
            targetsCaps.push(
              thisRoom.playersInGame[playerIndexFound].request.user.username
            );
          }

          thisRoom.sendText(
            thisRoom.allSockets,
            `Moderator ${senderSocket.request.user.username} has forced a move: `,
            'server-text'
          );
          thisRoom.sendText(
            thisRoom.allSockets,
            `Player: ${username} | Button: ${button} | Targets: ${targetsCaps}.`,
            'server-text'
          );

          const targetSimulatedSocket = thisRoom.playersInGame[playerIndex];
          if (targetSimulatedSocket.emit === undefined) {
            targetSimulatedSocket.emit = function () {};
          }
          thisRoom.gameMove(targetSimulatedSocket, [button, targetsCaps]);
        }
      },
    },

    mrevealrole: {
      command: 'mrevealrole',
      help:
        '/mrevealrole <username>: Reveal the role of a player. You must be present in the room for this to work.',
      run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Specify a username.',
            classStr: 'server-text',
          });
          return;
        }

        const roomId = senderSocket.request.user.inRoomId;
        if (rooms[roomId]) {
          const user =
            rooms[roomId].playersInGame[
              getIndexFromUsername(rooms[roomId].playersInGame, args[1], true)
            ];
          if (!rooms[roomId].gameStarted) {
            return {
              message: `Game has not started.`,
              classStr: 'server-text',
            };
          } else if (!user) {
            return {
              message: `Could not find ${args[1]}.`,
              classStr: 'server-text',
            };
          }
          rooms[roomId].sendText(
            rooms[roomId].allSockets,
            `Moderator ${senderSocket.request.user.username} has learned the role of ${user.username}.`,
            'server-text'
          );
          return {
            message: `${user.username}'s role is ${user.role.toUpperCase()}.`,
            classStr: 'server-text',
          };
        } else {
          return {
            message: `Could not find ${args[1]}, or you are not in a room.`,
            classStr: 'server-text',
          };
        }
      },
    },

    mrevealallroles: {
      command: 'mrevealallroles',
      help:
        '/mrevealallroles : Reveals the roles of all players in the current room.',
      run(data, senderSocket) {
        const roomId = senderSocket.request.user.inRoomId;
        if (rooms[roomId]) {
          if (!rooms[roomId].gameStarted) {
            return {
              message: `Game has not started.`,
              classStr: 'server-text',
            };
          }
          rooms[roomId].sendText(
            rooms[roomId].allSockets,
            `Moderator ${senderSocket.request.user.username} has learned all roles.`,
            'server-text'
          );

          // reveal role for each user
          rooms[roomId].playersInGame.forEach((user) => {
            senderSocket.emit('messageCommandReturnStr', {
              message: `${user.username}'s role is ${user.role.toUpperCase()}.`,
              classStr: 'server-text',
            });
          });
          return;
        } else {
          return { message: `You are not in a room.`, classStr: 'server-text' };
        }
      },
    },

    mtogglepause: {
      command: 'mtogglepause',
      help: '/mtogglepause: Pauses or unpauses the current room.',
      run(data, senderSocket) {
        const currentRoom = rooms[senderSocket.request.user.inRoomId];
        if (currentRoom) {
          // if unpaused, we pause
          // if not started or finished, no action
          if (!currentRoom.gameStarted) {
            return {
              message: `Game has not started.`,
              classStr: 'server-text',
            };
          }
          if (currentRoom.phase == 'finished') {
            return { message: `Game has finished.`, classStr: 'server-text' };
          }
          currentRoom.togglePause(senderSocket.request.user.username);
        } else {
          return { message: `You are not in a room.`, classStr: 'server-text' };
        }
      },
    },

    miplinkedaccs: {
      command: 'miplinkedaccs',
      help:
        '/miplinkedaccs <username> <fullTree>: Finds all accounts that have shared the same IPs the specified user. Put anything in <fullTree> to see full tree.',
      async run(data, senderSocket) {
        const { args } = data;

        // Send out data in a readable way to the mod.
        var dataToReturn = [];
        var linkedUsernamesWithLevel;
        var usernamesTree;
        var newUsernamesTreeLines = [];
        try {
          var ret = await IPLinkedAccounts(
            args[1],
            args[2] !== undefined ? true : false
          );
          linkedUsernamesWithLevel = ret.linkedUsernamesWithLevel;
          usernamesTree = ret.usernamesTree;
        } catch (e) {
          senderSocket.emit('messageCommandReturnStr', {
            message: e.message,
            classStr: 'server-text',
            dateCreated: new Date(),
          });
          return;
        }

        if (linkedUsernamesWithLevel.length === 0) {
          dataToReturn[0] = {
            message: 'There are no users with matching IPs (weird).',
            classStr: 'server-text',
            dateCreated: new Date(),
          };
        } else {
          dataToReturn[0] = {
            message: '-------------------------',
            classStr: 'server-text',
            dateCreated: new Date(),
          };
          // Old display:
          // for (obj of linkedUsernamesWithLevel) {
          //     dataToReturn.push({ message: `${obj.level} - ${obj.username}`, classStr: 'server-text', dateCreated: new Date() });
          // }

          lines = usernamesTree.split('\n');
          // console.log(lines);
          // Do my special replace white space with forced white space and append
          for (line of lines) {
            var replace = true;
            var newLine = '';
            for (ch of line) {
              if (ch == ' ' && replace) {
                newLine += '&#160;&#160;';
              } else if (!ch.match('/^[a-z0-9]+$/i')) {
                newLine += ch;
              } else {
                replace = false;
                newLine += ch;
              }
            }
            newLine = sanitizeHtml(newLine);
            dataToReturn.push({
              message: `${newLine}`,
              classStr: 'server-text',
              dateCreated: new Date(),
            });
            newUsernamesTreeLines.push(newLine);
          }

          dataToReturn.push({
            message: '-------------------------',
            classStr: 'server-text',
            dateCreated: new Date(),
          });
        }
        senderSocket.emit('messageCommandReturnStr', dataToReturn);

        // Create the ModLog
        const modUser = await User.findOne({
          usernameLower: senderSocket.request.user.username.toLowerCase(),
        });
        ModLog.create({
          type: 'miplinkedaccs',
          modWhoMade: {
            id: modUser._id,
            username: modUser.username,
            usernameLower: modUser.usernameLower,
          },
          data: {
            target: args[1],
            newUsernamesTreeLines: newUsernamesTreeLines,
            fullTree: args[2] !== undefined ? true : false,
          },
          dateCreated: new Date(),
        });
      },
    },
  },

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
              dataToReturn[i] = {
                message: actionsObj.adminCommands[key].help,
                classStr: 'server-text',
              };
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

        return {
          message: `The script uses approximately ${
            Math.round(used * 100) / 100
          } MB`,
          classStr: 'server-text',
        };
      },
    },

    aip: {
      command: 'aip',
      help: '/aip <player name>: Get the ip of the player.',
      async run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
          // console.log("a");
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Specify a username',
            classStr: 'server-text',
          });
          return { message: 'Specify a username.', classStr: 'server-text' };
        }

        const slapSocket =
          allSockets[getIndexFromUsername(allSockets, args[1])];
        if (slapSocket) {
          // console.log("b");
          const clientIpAddress =
            slapSocket.request.headers['x-forwarded-for'] ||
            slapSocket.request.connection.remoteAddress;

          senderSocket.emit('messageCommandReturnStr', {
            message: clientIpAddress,
            classStr: 'server-text',
          });

          return {
            message: 'slapSocket.request.user.username',
            classStr: 'server-text',
          };
        }

        // console.log("c");

        senderSocket.emit('messageCommandReturnStr', {
          message: 'No IP found or invalid username',
          classStr: 'server-text',
        });

        return { message: 'There is no such player.', classStr: 'server-text' };
      },
    },
    aipban: {
      command: 'aipban',
      help:
        '/aipban <ip>: Ban the IP of the IP given. /munban does not undo this ban. Contact ProNub to remove an IP ban.',
      run(data, senderSocket) {
        const { args } = data;

        if (!args[1]) {
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Specify an IP',
            classStr: 'server-text',
          });
          return { message: 'Specify a username.', classStr: 'server-text' };
        }

        User.find({
          usernameLower: senderSocket.request.user.username.toLowerCase(),
        })
          .populate('notifications')
          .exec((err, foundUser) => {
            if (err) {
              console.log(err);
            } else if (foundUser) {
              const banIpData = {
                type: 'ip',
                bannedIp: args[1],
                usernamesAssociated: [],
                modWhoBanned: {
                  id: foundUser._id,
                  username: foundUser.username,
                },
                whenMade: new Date(),
              };

              banIp.create(banIpData, (err, newBan) => {
                if (err) {
                  console.log(err);
                } else {
                  senderSocket.emit('messageCommandReturnStr', {
                    message: `Successfully banned ip ${args[1]}`,
                    classStr: 'server-text',
                  });
                }
              });
            } else {
              // send error message back
              senderSocket.emit('messageCommandReturnStr', {
                message:
                  "Could not find your user data (your own one, not the person you're trying to ban)",
                classStr: 'server-text',
              });
            }
          });
      },
    },
  },
};

const { userCommands } = actionsObj;
const { modCommands } = actionsObj;
const { adminCommands } = actionsObj;

ioGlobal = {};

module.exports = function (io) {
  // SOCKETS for each connection
  ioGlobal = io;
  io.sockets.on('connection', async (socket) => {
    console.log('Connection requested.');
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

    // Assign the socket their rating bracket
    socket = assignRatingBracket(socket);

    socket.request.displayUsername = socket.request.user.username;
    // Grab their rewards
    socket.rewards = await getAllRewardsForUser(socket.request.user);
    console.log('Socket rewards: ');
    console.log(socket.rewards);

    socket = applyApplicableRewards(socket);

    // now push their socket in
    allSockets.push(socket);

    // slight delay while client loads
    setTimeout(() => {
      console.log(
        `${socket.request.user.username} has connected under socket ID: ${socket.id}`
      );

      // send the user its ID to store on their side.
      socket.emit('username', socket.request.user.username);
      // send the user the list of commands
      socket.emit('commands', userCommands);

      // initialise not mod and not admin
      socket.isModSocket = false;
      socket.isAdminSocket = false;

      // if the mods name is inside the array
      if (
        modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1
      ) {
        // promote to mod socket
        socket.isModSocket = true;

        // send the user the list of commands
        socket.emit('modCommands', modCommands);

        // slight delay while client loads
        setTimeout(() => {
          actionsObj.modCommands.mcompareips.run(null, socket);
        }, 3000);

        avatarRequest
          .find({ processed: false })
          .exec((err, allAvatarRequests) => {
            if (err) {
              console.log(err);
            } else {
              socket.emit('', modCommands);

              setTimeout(() => {
                if (allAvatarRequests.length !== 0) {
                  if (allAvatarRequests.length === 1) {
                    socket.emit('allChatToClient', {
                      message: `There is ${allAvatarRequests.length} pending custom avatar request.`,
                      classStr: 'server-text',
                    });
                    socket.emit('roomChatToClient', {
                      message: `There is ${allAvatarRequests.length} pending custom avatar request.`,
                      classStr: 'server-text',
                    });
                  } else {
                    socket.emit('allChatToClient', {
                      message: `There are ${allAvatarRequests.length} pending custom avatar requests.`,
                      classStr: 'server-text',
                    });
                    socket.emit('roomChatToClient', {
                      message: `There are ${allAvatarRequests.length} pending custom avatar requests.`,
                      classStr: 'server-text',
                    });
                  }
                } else {
                  socket.emit('allChatToClient', {
                    message: 'There are no pending custom avatar requests!',
                    classStr: 'server-text',
                  });
                  socket.emit('roomChatToClient', {
                    message: 'There are no pending custom avatar requests!',
                    classStr: 'server-text',
                  });
                }
              }, 3000);
            }
          });
      }

      // if the admin name is inside the array
      if (
        adminsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1
      ) {
        // promote to admin socket
        socket.isAdminSocket = true;

        // send the user the list of commands
        socket.emit('adminCommands', adminCommands);
      }

      socket.emit('checkSettingsResetDate', dateResetRequired);
      socket.emit('checkNewUpdate', {
        date: newUpdateNotificationRequired,
        msg: updateMessage,
      });
      socket.emit('checkNewPlayerShowIntro', '');
      // Pass in the gameModes for the new room menu.
      socket.emit('gameModes', gameModeNames);

      User.findOne({ username: socket.request.user.username }).exec(
        (err, foundUser) => {
          if (foundUser.mutedPlayers) {
            socket.emit('updateMutedPlayers', foundUser.mutedPlayers);
          }
        }
      );

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
      const joiningIpAddress =
        socket.request.headers['x-forwarded-for'] ||
        socket.request.connection.remoteAddress;
      const joiningUsername = socket.request.user.username;
      for (var i = 0; i < allSockets.length; i++) {
        const clientIpAddress =
          allSockets[i].request.headers['x-forwarded-for'] ||
          allSockets[i].request.connection.remoteAddress;
        const clientUsername = allSockets[i].request.user.username;
        // console.log(clientUsername);
        // console.log(clientIpAddress);
        if (
          clientIpAddress === joiningIpAddress &&
          clientUsername !== joiningUsername
        )
          matchedIpsUsernames.push(clientUsername);
      }
      if (matchedIpsUsernames.length > 0) {
        sendToAllMods(io, {
          message: `MOD WARNING! '${socket.request.user.username}' has just logged in with the same IP as: `,
          classStr: 'server-text',
        });
        sendToAllMods(io, {
          message: '-------------------------',
          classStr: 'server-text',
        });
        for (var i = 0; i < matchedIpsUsernames.length; i++) {
          sendToAllMods(io, {
            message: matchedIpsUsernames[i],
            classStr: 'server-text',
          });
        }
        sendToAllMods(io, {
          message: '-------------------------',
          classStr: 'server-text',
        });
      }
    }, 1000);

    // when a user disconnects/leaves the whole website
    socket.on('disconnect', disconnect);

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
    socket.on('update-room-ranked', updateRoomRanked);

    //* ***********************
    // game data stuff
    //* ***********************
    socket.on('gameMove', gameMove);
    socket.on('setClaim', setClaim);
  });
};

function socketCallback(action, room) {
    if (action === 'finishGameResWin') {
        var data = {
            message: `Room ${room.roomId} has finished! The Resistance have won!`,
            classStr: 'all-chat-text-blue',
        };
        sendToAllChat(ioGlobal, data);
    }
    if (action === 'finishGameSpyWin') {
        var data = {
            message: `Room ${room.roomId} has finished! The Spies have won!`,
            classStr: 'all-chat-text-red',
        };
        sendToAllChat(ioGlobal, data);
    }
    if (action === 'updateCurrentGamesList') {
        updateCurrentGamesList();
    }  
    if (action === "updateCurrentPlayersList") {
        updateCurrentPlayersList();
    }
    if (action === "adjustRatingBrackets") {
        room.playersInGame.forEach((player) => {
            player = assignRatingBracket(player);
        });
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

// Assign players their rating bracket
var assignRatingBracket = function (socket) {
    const provisionalGames = 20;
    const beforeBracket = socket.request.user.ratingBracket;
    const socketRating = socket.request.user.playerRating;
    const bronzeBase = 1300;
    const silverBase = 1400;
    const goldBase = 1550;
    const platBase = 1700;
    const diamondBase = 1800;
    const championBase = 1900;

    if (socket.request.user.totalRankedGamesPlayed < provisionalGames) {
        socket.request.user.ratingBracket = 'unranked';
        socket.request.ratingBadge = `<span class='badge' data-toggle='tooltip' data-placement='right' title='Unranked' style='transform: scale(0.9) translateY(-9%); background-color: #a9a9a9'>?</span>`
    }
    else if (socketRating < bronzeBase) {
        socket.request.user.ratingBracket = 'iron';
        socket.request.ratingBadge = `<span class='badge' data-toggle='tooltip' data-placement='right' title='Iron' style='transform: scale(0.9) translateY(-9%); background-color: #303030'>I</span>`
    }
    else if (socketRating >= bronzeBase && socketRating < silverBase) {
        socket.request.user.ratingBracket = 'bronze';
        socket.request.ratingBadge = `<span class='badge' data-toggle='tooltip' data-placement='right' title='Bronze' style='transform: scale(0.9) translateY(-9%); background-color: #cd7f32'>B</span>`
    }
    else if (socketRating >= silverBase && socketRating < goldBase) {
        socket.request.user.ratingBracket = 'silver';
        socket.request.ratingBadge = `<span class='badge' data-toggle='tooltip' data-placement='right' title='Silver' style='transform: scale(0.9) translateY(-9%); background-color: #c0c0c0'>S</span>`
    }
    else if (socketRating >= goldBase && socketRating < platBase) {
        socket.request.user.ratingBracket = 'gold';
        socket.request.ratingBadge = `<span class='badge' data-toggle='tooltip' data-placement='right' title='Gold' style='transform: scale(0.9) translateY(-9%); background-color: #ffd700'>G</span>`
    }
    else if (socketRating >= platBase && socketRating < diamondBase) {
        socket.request.user.ratingBracket = 'platinum';
        socket.request.ratingBadge = `<span class='badge' data-toggle='tooltip' data-placement='right' title='Platinum' style='transform: scale(0.9) translateY(-9%); background-color: #afeeee'>P</span>`
    }
    else if (socketRating >= diamondBase && socketRating < championBase) {
        socket.request.user.ratingBracket = 'diamond';
        socket.request.ratingBadge = `<span class='badge' data-toggle='tooltip' data-placement='right' title='Diamond' style='transform: scale(0.9) translateY(-9%); background-color: rgb(0, 100, 250)'>D</span>`
    }
    else if (socketRating >= championBase) {
        socket.request.user.ratingBracket = 'champion';
        socket.request.ratingBadge = `<span class='badge' data-toggle='tooltip' data-placement='right' title='Champion' style='transform: scale(0.9) translateY(-9%); background-color: #9370db'>C</span>`
    }

    // If the rating bracket changes, update the database entry.
    if (socket.request.user.ratingBracket != beforeBracket) {
        User.findOne({ username: socket.request.user.username }).populate('notifications').exec((err, foundUser) => {
            if (err) { console.log(err); } else if (foundUser) {
                foundUser.ratingBracket = socket.request.user.ratingBracket;
                foundUser.save();
            }
        });
    }

    return socket;
} 

var updateCurrentPlayersList = function () {
    // 2D array of usernames, elo pairs and rating brackets, sorted in order of elo rating
    const playerList = []
    for (let i = 0; i < allSockets.length; i++) {
        playerList[i] = {};
        playerList[i].displayUsername = allSockets[i].request.displayUsername ? allSockets[i].request.displayUsername : allSockets[i].request.user.username;
        playerList[i].playerRating = Math.floor(allSockets[i].request.user.playerRating);
        playerList[i].ratingBracket = allSockets[i].request.user.ratingBracket;
        playerList[i].ratingBadge = allSockets[i].request.ratingBadge;
    }
    playerList.sort((a, b) => {
        return (a.playerRating < b.playerRating) ? 1 : (a.playerRating > b.playerRating) ? -1 : 0
    });
    
    allSockets.forEach((sock) => {
        sock.emit('update-current-players-list', playerList);
    });
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
            gamesList[i].gameType = rooms[i].ranked ? 'Ranked' : 'Unranked';
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

function destroyRoom(roomId) {
  if (rooms[roomId] === undefined || rooms[roomId] === null) {
    return;
  }

  deleteSaveGameFromDb(rooms[roomId]);

  // Stop bots thread if they are playing:
  if (rooms[roomId].interval) {
    clearInterval(rooms[roomId].interval);
    rooms[roomId].interval = undefined;
  }
  const thisGame = rooms[roomId];
  rooms[roomId].socketsOfPlayers
    .filter((socket) => socket.isBotSocket)
    .forEach((botSocket) => {
      botSocket.handleGameOver(thisGame, 'complete', () => {}); // This room is getting destroyed. No need to leave.
    });

  rooms[roomId] = undefined;

  console.log(`Destroyed room ${roomId}.`);
  // Ask nicely to garbage collect:
  // if (global.gc) {
  //     console.log("Running GC!");
  //     global.gc();
  //     console.log("Finished GC!");
  // }
}

function playerLeaveRoomCheckDestroy(socket) {
  roomId = socket.request.user.inRoomId;
  if (roomId && rooms[roomId]) {
    // leave the room
    rooms[roomId].playerLeaveRoom(socket);
    const toDestroy = rooms[roomId].destroyRoom;

    // if the game has started, wait to destroy to prevent lag spikes closing ongoing rooms
    if (toDestroy) {
      // if (rooms[roomId].gameStarted) {
      //     // If the timeout already exists, clear it
      //     if (rooms[roomId].destroyTimeoutObj) {
      //         clearTimeout(rooms[roomId].destroyTimeoutObj);
      //     }
      //     rooms[roomId].destroyTimeoutObj = setTimeout(() => {
      //         destroyRoom(roomId);
      //         updateCurrentGamesList();
      //     }, 30000);
      // }
      // else {
      destroyRoom(roomId);
      // }
    }

    // if room is frozen for more than 1hr then remove.
    if (
      rooms[roomId] &&
      rooms[roomId].timeFrozenLoaded &&
      rooms[roomId].getStatus() === 'Frozen' &&
      rooms[roomId].allSockets.length === 0
    ) {
      const curr = new Date();
      const timeToKill = 1000 * 60 * 5; // 5 mins
      // var timeToKill = 1000*10; //10s
      if (
        curr.getTime() - rooms[roomId].timeFrozenLoaded.getTime() >
        timeToKill
      ) {
        destroyRoom(roomId);

        console.log(
          `Been more than ${
            timeToKill / 1000
          } seconds, removing this frozen game.`
        );
      } else {
        console.log(
          `Frozen game has only loaded for ${
            (curr.getTime() - rooms[roomId].timeFrozenLoaded.getTime()) / 1000
          } seconds, Dont remove yet.`
        );
      }
    }

    socket.request.user.inRoomId = undefined;

    updateCurrentGamesList();
  }
}

function getPlayerDisplayUsernamesFromAllSockets() {
  const array = [];
  console.log(allSockets.length);
  for (let i = 0; i < allSockets.length; i++) {
    if (allSockets[i] !== undefined) {
      array[i] = allSockets[i].request.displayUsername
        ? allSockets[i].request.displayUsername
        : allSockets[i].request.user.username;
    } else {
      array[i] = '<error>';
    }
  }
  array.sort((a, b) => {
    const textA = a.toUpperCase();
    const textB = b.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });
  return array;
}

function getPlayerDisplayUsernamesAndElosFromAllSockets() {
    // 2D array of usernames and elo pairs, sorted in order of elo rating
    const array = []
    for (let i = 0; i < allSockets.length; i++) {
        array[i] = [allSockets[i].request.displayUsername ? allSockets[i].request.displayUsername : allSockets[i].request.user.username, Math.round(allSockets[i].request.user.playerRating)]
    }
    array.sort((a, b) => {
        return (a[1] < b[1]) ? 1 : (a[1] > b[1]) ? -1 : 0
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
    return textA < textB ? -1 : textA > textB ? 1 : 0;
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
        if (
          sockets[i].request.user.username.toLowerCase() ===
          username.toLowerCase()
        ) {
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
  // console.log(`Before: ${allSockets.length}`);
  // console.log(allSockets.indexOf(this));
  // console.log(allSockets);

  // delete allSockets[allSockets.indexOf(this)];
  allSockets.splice(allSockets.indexOf(this), 1);

  // console.log(`After: ${allSockets.length}`);
  // console.log(allSockets);

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
  } else if (
    modCommands[data.command] &&
    modsArray.indexOf(this.request.user.username.toLowerCase()) !== -1
  ) {
    var dataToSend = modCommands[data.command].run(data, this, ioGlobal);
    this.emit('messageCommandReturnStr', dataToSend);
  } else if (
    adminCommands[data.command] &&
    adminsArray.indexOf(this.request.user.username.toLowerCase()) !== -1
  ) {
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
  const socketWhoInitiatedInteract =
    allSockets[getIndexFromUsername(allSockets, data.interactedBy, true)];

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
  // console.log(`allchat: ${data.message} by: ${this.request.user.username}`);
  // get the username and put it into the data object

  const validUsernames = getPlayerUsernamesFromAllSockets();

  // if the username is not valid, i.e. one that they actually logged in as
  if (validUsernames.indexOf(this.request.user.username) === -1) {
    return;
  }

  data.username = this.request.displayUsername
    ? this.request.displayUsername
    : this.request.user.username;
  // send out that data object to all other clients (except the one who sent the message)
  data.message = textLengthFilter(data.message);
  // no classStr since its a player message

  sendToAllChat(ioGlobal, data);

  if (this.request.user.username.toLowerCase() === 'pronub') {
    if (data.message === 'sockets') {
      const data = {
        message: `Hi. Number of sockets: ${allSockets.length}`,
        classStr: 'server-text',
        dateCreated: new Date(),
      };
      this.emit('allChatToClient', data);
    }
    // else if (data.message === "snap") {
    //     heapdump.writeSnapshot((err, filename) => {
    //         console.log("Heap dump written to", filename);
    //     });
    // }
    else if (data.message === 'gc') {
      if (global.gc) {
        console.log('Running GC!');
        global.gc();
        console.log('Finished GC!');
      }
    }
  }
}

function roomChatFromClient(data) {
  // console.log(`roomchat: ${data.message} by: ${this.request.user.username}`);
  // get the username and put it into the data object

  const validUsernames = getPlayerUsernamesFromAllSockets();

  // if the username is not valid, i.e. one that they actually logged in as
  if (validUsernames.indexOf(this.request.user.username) === -1) {
    return;
  }

  data.username = this.request.displayUsername
    ? this.request.displayUsername
    : this.request.user.username;

  data.message = textLengthFilter(data.message);
  data.dateCreated = new Date();

  if (this.request.user.inRoomId) {
    // send out that data object to all clients in room

    sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);
    // ioGlobal.in(data.roomId).emit("roomChatToClient", data);
  }
}

function newRoom(dataObj) {
    if (dataObj) {
        // while rooms exist already (in case of a previously saved and retrieved game)
        while (rooms[nextRoomId]) {
            nextRoomId++;
        }
        privateRoom = !(dataObj.newRoomPassword === '')
        rankedRoom = (dataObj.ranked === "ranked") && !privateRoom
        rooms[nextRoomId] = new gameRoom(this.request.user.username, nextRoomId, ioGlobal, dataObj.maxNumPlayers, dataObj.newRoomPassword, dataObj.gameMode, rankedRoom, socketCallback);
        const privateStr = !privateRoom ? '' : 'private ';
        const rankedUnrankedStr = rankedRoom ? 'ranked' : 'unranked';
        // broadcast to all chat
        const data = {
            message: `${this.request.user.username} has created ${rankedUnrankedStr} ${privateStr}room ${nextRoomId}.`,
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
  if (rooms[roomId]) {
    // if the room has not started yet, throw them into the room
    // console.log("Game status is: " + rooms[roomId].getStatus());

    if (rooms[roomId].getStatus() === 'Waiting') {
      const ToF = rooms[roomId].playerSitDown(this);
      console.log(
        `${this.request.user.username} has joined room ${roomId}: ${ToF}`
      );
    } else {
      // console.log("Game has started, player " + this.request.user.username + " is not allowed to join.");
    }
  }
}

function standUpFromGame() {
  const roomId = this.request.user.inRoomId;

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

function leaveRoom() {
  // console.log("In room id");
  // console.log(this.request.user.inRoomId);

  if (rooms[this.request.user.inRoomId]) {
    console.log(
      `${this.request.user.username} is leaving room: ${this.request.user.inRoomId}`
    );
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
  if (gameMode === null || gameMode === undefined) {
    this.emit(
      'danger-alert',
      'Something went wrong. Cannot detect game mode specified.'
    );
    return;
  }

  if (rooms[this.request.user.inRoomId]) {
    if (
      this.request.user.inRoomId &&
      this.request.user.username === rooms[this.request.user.inRoomId].host
    ) {
      rooms[this.request.user.inRoomId].hostTryStartGame(data, gameMode);
      // this.emit("update-room-players", rooms[roomId].getPlayers());
    } else {
      // console.log("Room doesn't exist or user is not host, cannot start game");
      this.emit(
        'danger-alert',
        'You are not the host. You cannot start the game.'
      );
      return;
    }
  }
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
        if (rooms[this.request.user.inRoomId].requireSave === true) {
          rooms[this.request.user.inRoomId].requireSave = false;
          saveGameToDb(rooms[this.request.user.inRoomId]);
          console.log(`Saving game ${this.request.user.inRoomId}`);
        }
      }
    }
  }
}

function updateRoomGameMode(gameMode) {
  if (rooms[this.request.user.inRoomId]) {
    rooms[this.request.user.inRoomId].updateGameModesInRoom(this, gameMode);
  }
  updateCurrentGamesList();
}

function updateRoomRanked(rankedType) {
    if (rooms[this.request.user.inRoomId]) {
        rooms[this.request.user.inRoomId].updateRanked(this, rankedType);
    }
    updateCurrentGamesList();
}

function updateRoomMaxPlayers(number) {
  if (rooms[this.request.user.inRoomId]) {
    rooms[this.request.user.inRoomId].updateMaxNumPlayers(this, number);
  }
  updateCurrentGamesList();
}
