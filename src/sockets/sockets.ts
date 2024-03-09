// @ts-nocheck
import { Server as SocketServer, Socket } from 'socket.io';
import { SocketUser } from './types';

import GameWrapper from '../gameplay/gameWrapper';

import savedGameObj from '../models/savedGame';
import { getAllRewardsForUser } from '../rewards/getRewards';
import REWARDS from '../rewards/constants';
import avatarRequest from '../models/avatarRequest';
import User from '../models/user';
import ModLog from '../models/modLog';
import JSON from 'circular-json';

import { isAdmin } from '../modsadmins/admins';
import { isMod } from '../modsadmins/mods';
import { isTO } from '../modsadmins/tournamentOrganizers';
import {
  GAME_MODE_NAMES,
  GameMode,
  isGameMode,
  strToGameMode,
} from '../gameplay/gameModes';

import { ChatSpamFilter } from './filters/chatSpamFilter';
import { MessageWithDate, Quote } from './quote';

import { adminCommands } from './commands/admin';
import { modCommands } from './commands/mod';
import { mtogglepause } from './commands/mod/mtogglepause';
import { mrevealallroles } from './commands/mod/mrevealallroles';

import { lastWhisperObj } from './commands/mod/mwhisper';
import * as util from 'util';
import { RoomCreationType } from '../gameplay/roomTypes';
import { CreateRoomFilter } from './filters/createRoomFilter';
import Game, { GameConfig } from '../gameplay/game';
import { RoomConfig } from '../gameplay/room';
import { MatchmakingQueue, QueueEntry } from './matchmakingQueue';
import { ReadyPrompt, ReadyPromptReplyFromClient } from './readyPrompt';
import { JoinQueueFilter } from './filters/joinQueueFilter';
import { Role } from '../gameplay/roles/types';

const chatSpamFilter = new ChatSpamFilter();
const createRoomFilter = new CreateRoomFilter();
// Only used for ranked games at the moment
const matchmakingQueue = new MatchmakingQueue(matchFound);
const joinQueueFilter = new JoinQueueFilter(() => new Date());
const readyPrompt = new ReadyPrompt();

if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    chatSpamFilter.tick();
  }, 1000);
}

const quote = new Quote();

const dateResetRequired = 1543480412695;

export const allSockets: SocketUser[] = [];

// TODO: This is bad!!! We should work to make this not needed to be exported.
export const rooms: GameWrapper[] = [];
export let nextRoomId = 1;

export function incrementNextRoomId(): void {
  nextRoomId++;
}

const allChat5Min: any[] = [];

const possibleInteracts = ['buzz', 'pat', 'poke', 'punch', 'slap', 'hug'];
const possibleInteractsPast = [
  'buzzed',
  'patted',
  'poked',
  'punched',
  'slapped',
  'hugged',
];

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
  for (const socket of allSockets) {
    socket.emit('server-restarting');
  }

  console.log('Graceful shutdown request');
  process.exit();
}

export function saveGameToDb(roomToSave) {
  if (roomToSave.gameStarted === true && roomToSave.finished !== true) {
    // Take out io stuff since we don't need it.
    const deepCopyRoom = JSON.parse(JSON.stringify(roomToSave));
    deepCopyRoom.io = undefined;
    deepCopyRoom.allSockets = undefined;
    deepCopyRoom.socketsOfPlayers = undefined;

    for (let i = 0; i < deepCopyRoom.playersInGame.length; i++) {
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
        },
      );
    } else {
      savedGameObj.findByIdAndUpdate(
        roomToSave.savedGameRecordId,
        { room: JSON.stringify(deepCopyRoom) },
        (err, savedGame) => {
          // console.log("Successfully saved this game");
        },
      );
    }
  }
}

function deleteSaveGameFromDb(room) {
  if (room) {
    savedGameObj.findByIdAndRemove(room.savedGameRecordId, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
}

if (process.env.NODE_ENV !== 'test') {
  setTimeout(async () => {
    let run = true;
    let i = 0;
    while (run) {
      await new Promise((resolve) => {
        savedGameObj
          .find({})
          .skip(i)
          .limit(1)
          .exec((err, foundSaveGameArr) => {
            if (!foundSaveGameArr || foundSaveGameArr.length === 0) {
              run = false;
              return;
            }
            const foundSaveGame = foundSaveGameArr[0];

            if (foundSaveGame && foundSaveGame.room) {
              const storedData = JSON.parse(foundSaveGame.room);
              console.log('Loaded room ' + storedData.roomId);

              // Empty configs
              const roomConfig = new RoomConfig(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                storedData.gameMode,
                undefined,
                undefined,
              );
              const gameConfig = new GameConfig(
                roomConfig,
                undefined,
                undefined,
                undefined,
                undefined,
              );

              rooms[storedData.roomId] = new GameWrapper(gameConfig, null);

              Object.assign(rooms[storedData.roomId], storedData);

              rooms[storedData.roomId].savedGameRecordId = foundSaveGame.id;
              rooms[storedData.roomId].recoverGame(storedData);
              rooms[storedData.roomId].callback = socketCallback;
            } else {
              run = false;
            }
            resolve();
          });
      });

      i += 1;
    }
  }, 1000);
}
const pmmodCooldowns = {};
const PMMOD_TIMEOUT = 3000; // 3 seconds

export const TOCommands = {
  t: {
    command: 't',
    help: '/t: displays /thelp',
    run(data, senderSocket) {
      return TOCommands.thelp.run(data, senderSocket);
    },
  },
  thelp: {
    command: 'thelp',
    help: '/thelp: show commands.',
    run(data, senderSocket) {
      const { args } = data;
      // do stuff
      const dataToSend = [];
      let i = 0;
      i++;

      for (const key in TOCommands) {
        if (TOCommands.hasOwnProperty(key)) {
          dataToSend[i] = {
            message: TOCommands[key].help,
            classStr: 'server-text',
          };
          i++;
        }
      }
      senderSocket.emit('messageCommandReturnStr', dataToSend);
    },
  },

  tforcemove: {
    command: 'tforcemove',
    help: "/tforcemove <username> [button] [target]: Forces a player to make a move. To see what moves are available, enter the target's username. To force the move, input button and/or target.",
    run: modCommands.mforcemove.run,
  },

  trevealallroles: {
    command: 'trevealallroles',
    help: '/trevealallroles : Reveals the roles of all players in the current room.',
    run: mrevealallroles.run,
  },

  ttogglepause: {
    command: 'ttogglepause',
    help: '/ttogglepause: Pauses or unpauses the current room.',
    run: mtogglepause.run,
  },

  twhisper: {
    command: 'twhisper',
    help: '/twhisper <player name> <text to send>: Sends a whisper to a player.',
    run: modCommands.mwhisper.run,
  },
};

export const userCommands = {
  help: {
    command: 'help',
    help: '/help: ...shows help',
    run(data, senderSocket) {
      // do stuff

      const dataToSend = [];
      let i = 0;

      i++;

      for (const key in userCommands) {
        if (userCommands.hasOwnProperty(key)) {
          if (!userCommands[key].modsOnly) {
            dataToSend[i] = {
              message: userCommands[key].help,
              classStr: 'server-text',
              dateCreated: new Date(),
            };
            i++;
          }
        }
      }
      senderSocket.emit('messageCommandReturnStr', dataToSend);
    },
  },

  buzz: {
    command: 'buzz',
    help: '/buzz <playername>: Buzz a player.',
    run(data, senderSocket) {
      const { args } = data;

      if (args.length <= 1) {
        return {
          message: 'You must provide a username.',
          classStr: 'server-text',
          dateCreated: new Date(),
        };
      }

      data.args[2] = data.args[1];
      data.args[1] = 'buzz';

      return userCommands.interactUser.run(data, senderSocket);
    },
  },

  pat: {
    command: 'pat',
    help: '/pat <playername>: Pat a player.',
    run(data, senderSocket) {
      const { args } = data;

      if (args.length <= 1) {
        return {
          message: 'You must provide a username.',
          classStr: 'server-text',
          dateCreated: new Date(),
        };
      }

      data.args[2] = data.args[1];
      data.args[1] = 'pat';

      return userCommands.interactUser.run(data, senderSocket);
    },
  },

  poke: {
    command: 'poke',
    help: '/poke <playername>: Poke a player.',
    run(data, senderSocket) {
      const { args } = data;

      if (args.length <= 1) {
        return {
          message: 'You must provide a username.',
          classStr: 'server-text',
          dateCreated: new Date(),
        };
      }

      data.args[2] = data.args[1];
      data.args[1] = 'poke';

      return userCommands.interactUser.run(data, senderSocket);
    },
  },

  punch: {
    command: 'punch',
    help: '/punch <playername>: Punch a player.',
    run(data, senderSocket) {
      const { args } = data;

      if (args.length <= 1) {
        return {
          message: 'You must provide a username.',
          classStr: 'server-text',
          dateCreated: new Date(),
        };
      }

      data.args[2] = data.args[1];
      data.args[1] = 'punch';

      return userCommands.interactUser.run(data, senderSocket);
    },
  },

  slap: {
    command: 'slap',
    help: '/slap <playername>: Slap a player for fun.',
    run(data, senderSocket) {
      const { args } = data;

      if (args.length <= 1) {
        return {
          message: 'You must provide a username.',
          classStr: 'server-text',
          dateCreated: new Date(),
        };
      }

      data.args[2] = data.args[1];
      data.args[1] = 'slap';

      return userCommands.interactUser.run(data, senderSocket);
    },
  },

  hug: {
    command: 'hug',
    help: '/hug <playername>: Hug a player.',
    run(data, senderSocket) {
      const { args } = data;

      if (args.length <= 1) {
        return {
          message: 'You must provide a username.',
          classStr: 'server-text',
          dateCreated: new Date(),
        };
      }

      data.args[2] = data.args[1];
      data.args[1] = 'hug';

      return userCommands.interactUser.run(data, senderSocket);
    },
  },

  interactUser: {
    command: 'interactUser',
    help: '/interactUser <buzz/pat/poke/punch/slap/hug> <playername>: Interact with a player.',
    run(data, senderSocket) {
      console.log('interact user', data);
      const { args } = data;

      if (possibleInteracts.indexOf(args[1]) === -1) {
        return {
          message: `You can only buzz, pat, poke, punch, slap, or hug; not ${args[1]}.`,
          classStr: 'server-text',
          dateCreated: new Date(),
        };
      }

      const targetSocket =
        allSockets[getIndexFromUsername(allSockets, args[2], true)];
      if (targetSocket) {
        let verbPast =
          possibleInteractsPast[possibleInteracts.indexOf(args[1])];

        const dataToSend = {
          username: senderSocket.request.user.username,
          verb: args[1],
          verbPast,
        };
        targetSocket.emit('interactUser', dataToSend);

        // if the sendersocket is in a game, then send a message to everyone in the game.
        let interactedInGame = false;
        let resquestorSocket;
        // need to know which person is in the room, if theyre both then it doesnt matter who.
        if (
          senderSocket.request.user.inRoomId &&
          rooms[senderSocket.request.user.inRoomId] &&
          rooms[senderSocket.request.user.inRoomId].gameStarted === true
        ) {
          interactedInGame = true;
          resquestorSocket = senderSocket;
        } else if (
          targetSocket.request.user.inRoomId &&
          rooms[targetSocket.request.user.inRoomId] &&
          rooms[targetSocket.request.user.inRoomId].gameStarted === true
        ) {
          interactedInGame = true;
          resquestorSocket = targetSocket;
        }

        if (interactedInGame === true) {
          const str = `${senderSocket.request.user.username} has ${verbPast} ${targetSocket.request.user.username}. (In game)`;
          rooms[resquestorSocket.request.user.inRoomId].sendText(
            str,
            'server-text',
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
    help: '/roll <optional number>: Returns a random number between 1 and 10 or 1 and optional number.',
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
        isMod(username),
      );
      const message = `Currently online mods: ${
        modUsers.length > 0 ? modUsers.join(', ') : 'None'
      }.`;
      return { message, classStr: 'server-text' };
    },
  },

  pmmod: {
    command: 'pmmod',
    help: '/pmmod <mod_username> <message>: Sends a private message to an online moderator.',
    run(data, senderSocket) {
      const { args } = data;
      // We check if they are spamming, i.e. have sent a PM before the timeout is up
      const lastPmTime = pmmodCooldowns[senderSocket.id];
      if (lastPmTime) {
        const remaining = new Date() - lastPmTime;
        if (remaining < PMMOD_TIMEOUT)
          return {
            message: `Please wait ${Math.ceil(
              (PMMOD_TIMEOUT - remaining) / 1000,
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
      if (!isMod(args[1]))
        return {
          message: `${args[1]} is not a mod. You may not private message them.`,
          classStr: 'server-text',
        };

      const str = `${senderSocket.request.user.username}->${
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

      // Send out a buzz to mods
      const buzzData = {
        command: 'buzz',
        args: ['/buzz', 'buzz', args[1]],
      };
      userCommands.interactUser.run(buzzData, senderSocket);

      // Set a cooldown for the sender until they can send another pm
      pmmodCooldowns[senderSocket.id] = new Date();

      // Create the mod log.
      const mlog = ModLog.create({
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
    help: '/mute: Mute a player who is being annoying in chat/buzzing/slapping/poking/tickling/hugging you.',
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
                    foundUserToMute.username,
                  ) === -1
                ) {
                  userCallingMute.mutedPlayers.push(foundUserToMute.username);
                  userCallingMute.markModified('mutedPlayers');
                  userCallingMute.save();
                  senderSocket.emit(
                    'updateMutedPlayers',
                    userCallingMute.mutedPlayers,
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

                senderSocket.emit('updateMutedPlayers', foundUser.mutedPlayers);
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
          },
        );
      } else {
        senderSocket.emit('messageCommandReturnStr', {
          message: `${args[1]} was not found or was not muted from the start.`,
          classStr: 'server-text',
        });
      }
    },
  },

  muted: {
    command: 'muted',
    help: '/muted: See who you have muted.',
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
        },
      );
    },
  },

  navbar: {
    command: 'navbar',
    help: '/navbar: Hides and unhides the top navbar. Some phone screens may look better with the navbar turned off.',
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
            true,
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

        const modlog =
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
    help: '/guessmerlin <playername>: Solely for fun, submit your guess of who you think is Merlin.',
    run(data, senderSocket) {
      // Check the guesser is at a table
      let messageToClient;
      if (
        senderSocket.request.user.inRoomId === undefined ||
        rooms[senderSocket.request.user.inRoomId].gameStarted !== true ||
        rooms[senderSocket.request.user.inRoomId].phase === 'Finished'
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
      return userCommands.guessmerlin.run(data, senderSocket);
    },
  },
  votePauseTimeout: {
    command: 'votePauseTimeout',
    help: '/votePauseTimeout: Vote to pause timeout. Requires number_of_resistance + 1 votes.',
    run(data, senderSocket) {
      if (!senderSocket.request.user.inRoomId) {
        senderSocket.emit('messageCommandReturnStr', {
          message: 'You must be in a room to use /votePauseTimeout.',
          classStr: 'server-text',
        });
      }

      rooms[senderSocket.request.user.inRoomId].votePauseTimeout(senderSocket);
    },
  },

  voteUnpauseTimeout: {
    command: 'voteUnpauseTimeout',
    help: '/voteUnpauseTimeout: Vote to unpause timeout. Requires 1 vote.',
    run(data, senderSocket) {
      if (!senderSocket.request.user.inRoomId) {
        senderSocket.emit('messageCommandReturnStr', {
          message: 'You must be in a room to use /votePauseTimeout.',
          classStr: 'server-text',
        });
      }

      rooms[senderSocket.request.user.inRoomId].voteUnpauseTimeout(
        senderSocket,
      );
    },
  },

  getblacklist: {
    command: 'getblacklist',
    help: '/getblacklist: Shows your current blacklist for matchmaking. Will not match you into these players.',
    run(data, senderSocket) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Your blacklist:',
        classStr: 'server-text',
      });

      const dataToSend = [];
      for (const username of senderSocket.request.user.matchmakingBlacklist) {
        dataToSend.push({
          message: username,
          classStr: 'server-text',
        });
      }

      senderSocket.emit('messageCommandReturnStr', dataToSend);
    },
  },

  addblacklist: {
    command: 'addblacklist',
    help: '/addblacklist <username>: Adds a user to your blacklist. Maximum of 50 users.',
    run(data, senderSocket) {
      const { args } = data;
      if (args.length < 2) {
        return {
          message: 'Please specify a username.',
          classStr: 'server-text',
        };
      }

      const usernameToBlacklist = args[1].toLowerCase();

      if (senderSocket.request.user.matchmakingBlacklist.length > 50) {
        return {
          message: 'You have too many users. Please remove some.',
          classStr: 'server-text',
        };
      }

      if (
        senderSocket.request.user.matchmakingBlacklist.includes(
          usernameToBlacklist,
        )
      ) {
        return {
          message: `You already have ${usernameToBlacklist} on your blacklist.`,
          classStr: 'server-text',
        };
      }

      senderSocket.request.user.matchmakingBlacklist.push(usernameToBlacklist);
      senderSocket.request.user.markModified('matchmakingBlacklist');
      senderSocket.request.user.save();
      return {
        message: `Added ${usernameToBlacklist} to your blacklist.`,
        classStr: 'server-text',
      };
    },
  },

  removeblacklist: {
    command: 'removeblacklist',
    help: '/removeblacklist <username>: Removes a user from your blacklist.',
    run(data, senderSocket) {
      const { args } = data;
      if (args.length < 2) {
        return {
          message: 'Please specify a username.',
          classStr: 'server-text',
        };
      }

      const usernameToBlacklist = args[1].toLowerCase();

      const index =
        senderSocket.request.user.matchmakingBlacklist.indexOf(
          usernameToBlacklist,
        );
      if (index === -1) {
        return {
          message: `${usernameToBlacklist} was not on your blacklist.`,
          classStr: 'server-text',
        };
      }
      senderSocket.request.user.matchmakingBlacklist.splice(index, 1);
      senderSocket.request.user.markModified('matchmakingBlacklist');
      senderSocket.request.user.save();

      return {
        message: `Removed ${usernameToBlacklist} from your blacklist.`,
        classStr: 'server-text',
      };
    },
  },
};

export let ioGlobal = {};

export const server = function (io: SocketServer): void {
  // SOCKETS for each connection
  ioGlobal = io;
  io.sockets.on('connection', async (socket: SocketUser) => {
    // remove any duplicate sockets
    for (let i = 0; i < allSockets.length; i++) {
      if (allSockets[i].request.user.id === socket.request.user.id) {
        allSockets[i].emit('dont-reconnect');
        allSockets[i].disconnect(true);
      }
    }

    // Assign the socket their rating bracket
    socket = assignRatingBracket(socket);

    socket.request.displayUsername = socket.request.user.username;
    socket.rewards = await getAllRewardsForUser(socket.request.user);

    socket = applyApplicableRewards(socket);

    // now push their socket in
    allSockets.push(socket);

    socket.onAny((eventName, ...args) => {
      console.log(
        `[Client Socket] username=${
          socket.request.user.username
        },eventName=${eventName},args=${util.inspect(args, {
          breakLength: Infinity,
        })}`,
      );
    });

    // slight delay while client loads
    setTimeout(() => {
      // send the user its ID to store on their side.
      socket.emit('username', socket.request.user.username);
      // send the user the list of commands
      socket.emit('commands', userCommands);

      // initialise not mod and not admin
      socket.isAdminSocket = false;
      socket.isModSocket = false;
      socket.isTOSocket = false;

      // if the admin name is inside the array
      if (isAdmin(socket.request.user.username)) {
        // promote to admin socket
        socket.isAdminSocket = true;

        // TODO this shouldn't be sent out as separate commands. Merge these.

        // send the user the list of commands
        socket.emit('adminCommands', adminCommands);
      }

      if (isMod(socket.request.user.username)) {
        // promote to mod socket
        socket.isModSocket = true;

        // send the user the list of commands
        socket.emit('modCommands', modCommands);

        // slight delay while client loads
        setTimeout(() => {
          modCommands.mcompareips.run(null, socket);
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

      if (isTO(socket.request.user.username)) {
        socket.isTOSocket = true;

        // send the user the list of commands
        socket.emit('TOCommands', TOCommands);
      }

      socket.emit('checkSettingsResetDate', dateResetRequired);
      socket.emit('checkNewPlayerShowIntro', '');
      // Pass in the gameModes for the new room menu.
      socket.emit('gameModes', GAME_MODE_NAMES);

      User.findOne({ username: socket.request.user.username }).exec(
        (err, foundUser) => {
          if (foundUser.mutedPlayers) {
            socket.emit('updateMutedPlayers', foundUser.mutedPlayers);
          }
        },
      );

      // automatically join the all chat
      socket.join('allChat');

      // socket sends to all players
      sendToAllChat(io, {
        message: `${socket.request.user.username} has joined the lobby.`,
        classStr: 'server-text-teal',
      });

      socket.emit('allChatToClient', {
        message: '⚡️ Please be kind, we were all new once ⚡️',
        classStr: 'server-text',
        dateCreated: new Date(),
      });

      socket.emit('allChatToClient', {
        message:
          'We have a discord server! Join us here: https://discord.gg/3mHdKNT',
        classStr: 'server-text',
        dateCreated: new Date(),
      });

      if (socket.request.user.lastLoggedIn.length > 0) {
        const msg4 = {
          message: '',
          classStr: 'server-text',
          dateCreated: new Date(),

          type: 'lastLoggedIn', // special type to render client side local time
          lastLoggedInDate: socket.request.user.lastLoggedIn[0],
        };

        socket.emit('allChatToClient', msg4);
      }

      updateCurrentPlayersList(io);
      updateCurrentGamesList(io);

      socket.emit('numPlayersInQueue', {
        numPlayersInQueue: matchmakingQueue.getNumInQueue(),
      });
    }, 1000);

    socket.on('disconnect', disconnect);

    socket.on('messageCommand', messageCommand);
    socket.on('interactUserPlayed', interactUserPlayed);
    socket.on('allChatFromClient', allChatFromClient);
    socket.on('roomChatFromClient', roomChatFromClient);
    socket.on('newRoom', newRoom);
    socket.on('join-room', joinRoom);
    socket.on('join-game', joinGame);
    socket.on('standUpFromGame', standUpFromGame);
    socket.on('leave-room', leaveRoom);
    socket.on('startGame', startGame);
    socket.on('kickPlayer', kickPlayer);
    socket.on('join-queue', joinQueue);
    socket.on('leave-queue', leaveQueue);
    socket.on('ready-prompt-reply', readyPromptHandler);
    socket.on('update-room-max-players', updateRoomMaxPlayers);
    socket.on('update-room-game-mode', updateRoomGameMode);
    socket.on('update-room-ranked', updateRoomRanked);
    socket.on('update-room-muteSpectators', updateRoomMuteSpectators);
    socket.on('update-room-disableVoteHistory', updateRoomDisableVoteHistory);

    socket.on('gameMove', gameMove);
    socket.on('setClaim', setClaim);
  });
};

export function socketCallback(action, room) {
  let data;
  if (action === 'finishGameResWin') {
    data = {
      message: `Room ${room.roomId} has finished! The Resistance have won!`,
      classStr: 'all-chat-text-blue',
    };
    sendToAllChat(ioGlobal, data);
  }
  if (action === 'finishGameSpyWin') {
    data = {
      message: `Room ${room.roomId} has finished! The Spies have won!`,
      classStr: 'all-chat-text-red',
    };
    sendToAllChat(ioGlobal, data);
  }
  if (action === 'updateCurrentGamesList') {
    updateCurrentGamesList();
  }
  if (action === 'updateCurrentPlayersList') {
    updateCurrentPlayersList();
  }
  if (action === 'adjustRatingBrackets') {
    room.playersInGame.forEach((player) => {
      player = assignRatingBracket(player);
    });
  }
}

const applyApplicableRewards = function (socket) {
  // Admin badge
  if (socket.rewards.includes(REWARDS.ADMIN_BADGE)) {
    socket.request.badge = 'A';
  }
  // Moderator badge
  else if (socket.rewards.includes(REWARDS.MOD_BADGE)) {
    socket.request.badge = 'M';
  }
  // TO badge
  else if (socket.rewards.includes(REWARDS.TO_BADGE)) {
    socket.request.badge = 'T';
  }
  // Tier4 badge
  if (socket.rewards.includes(REWARDS.TIER4_BADGE)) {
    socket.request.badge = 'T4';
  }
  // Tier3 badge
  else if (socket.rewards.includes(REWARDS.TIER3_BADGE)) {
    socket.request.badge = 'T3';
  }
  // Tier2 badge
  else if (socket.rewards.includes(REWARDS.TIER2_BADGE)) {
    socket.request.badge = 'T2';
  }
  // Tier1 badge
  else if (socket.rewards.includes(REWARDS.TIER1_BADGE)) {
    socket.request.badge = 'T1';
  }

  return socket;
};

const assignRatingBracket = function (socket) {
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
    socket.request.ratingBadge =
      "<span class='badge' data-toggle='tooltip' data-placement='right' title='Unranked' style='transform: scale(0.9) translateY(-9%); background-color: #a9a9a9'>?</span>";
  } else if (socketRating < bronzeBase) {
    socket.request.user.ratingBracket = 'iron';
    socket.request.ratingBadge =
      "<span class='badge' data-toggle='tooltip' data-placement='right' title='Iron' style='transform: scale(0.9) translateY(-9%); background-color: #303030'>I</span>";
  } else if (socketRating >= bronzeBase && socketRating < silverBase) {
    socket.request.user.ratingBracket = 'bronze';
    socket.request.ratingBadge =
      "<span class='badge' data-toggle='tooltip' data-placement='right' title='Bronze' style='transform: scale(0.9) translateY(-9%); background-color: #cd7f32'>B</span>";
  } else if (socketRating >= silverBase && socketRating < goldBase) {
    socket.request.user.ratingBracket = 'silver';
    socket.request.ratingBadge =
      "<span class='badge' data-toggle='tooltip' data-placement='right' title='Silver' style='transform: scale(0.9) translateY(-9%); background-color: #c0c0c0'>S</span>";
  } else if (socketRating >= goldBase && socketRating < platBase) {
    socket.request.user.ratingBracket = 'gold';
    socket.request.ratingBadge =
      "<span class='badge' data-toggle='tooltip' data-placement='right' title='Gold' style='transform: scale(0.9) translateY(-9%); background-color: #ffd700'>G</span>";
  } else if (socketRating >= platBase && socketRating < diamondBase) {
    socket.request.user.ratingBracket = 'platinum';
    socket.request.ratingBadge =
      "<span class='badge' data-toggle='tooltip' data-placement='right' title='Platinum' style='transform: scale(0.9) translateY(-9%); background-color: #afeeee'>P</span>";
  } else if (socketRating >= diamondBase && socketRating < championBase) {
    socket.request.user.ratingBracket = 'diamond';
    socket.request.ratingBadge =
      "<span class='badge' data-toggle='tooltip' data-placement='right' title='Diamond' style='transform: scale(0.9) translateY(-9%); background-color: rgb(0, 100, 250)'>D</span>";
  } else if (socketRating >= championBase) {
    socket.request.user.ratingBracket = 'champion';
    socket.request.ratingBadge =
      "<span class='badge' data-toggle='tooltip' data-placement='right' title='Champion' style='transform: scale(0.9) translateY(-9%); background-color: #9370db'>C</span>";
  }

  // If the rating bracket changes, update the database entry.
  if (socket.request.user.ratingBracket != beforeBracket) {
    User.findOne({ username: socket.request.user.username })
      .populate('notifications')
      .exec((err, foundUser) => {
        if (err) {
          console.log(err);
        } else if (foundUser) {
          foundUser.ratingBracket = socket.request.user.ratingBracket;
          foundUser.save();
        }
      });
  }

  return socket;
};

const updateCurrentPlayersList = function () {
  // 2D array of usernames, elo pairs and rating brackets, sorted in order of elo rating
  const playerList = [];
  for (let i = 0; i < allSockets.length; i++) {
    playerList[i] = {};
    playerList[i].displayUsername = allSockets[i].request.displayUsername
      ? allSockets[i].request.displayUsername
      : allSockets[i].request.user.username;
    playerList[i].playerRating = Math.floor(
      allSockets[i].request.user.playerRating,
    );
    playerList[i].ratingBracket = allSockets[i].request.user.ratingBracket;
    playerList[i].ratingBadge = allSockets[i].request.ratingBadge;
    playerList[i].badge = allSockets[i].request.badge;
  }

  playerList.sort((a, b) => {
    return a.playerRating < b.playerRating
      ? 1
      : a.playerRating > b.playerRating
      ? -1
      : 0;
  });

  allSockets.forEach((sock) => {
    sock.emit('update-current-players-list', playerList);
  });
};

export const updateCurrentGamesList = function () {
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
      gamesList[i].gameMode =
        rooms[i].gameMode.charAt(0).toUpperCase() + rooms[i].gameMode.slice(1);
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
      gamesList[i].numOfSpectatorsInside =
        rooms[i].allSockets.length - rooms[i].socketsOfPlayers.length;
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

export function sendToAllChat(io, data) {
  const fiveMinsInMillis = 1000 * 60 * 5;

  const date = new Date();
  data.dateCreated = date;

  allSockets.forEach((sock) => {
    sock.emit('allChatToClient', data);
  });

  console.log(
    `[All Chat] ${data.username ? `${data.username}: ` : ''}${data.message}`,
  );

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
  // Already logged upstream in roomChatFromClient.
  if (!data.username) {
    console.log(`[Room Chat] [Room ${roomId}] ${data.message}`);
  }
  if (rooms[roomId]) {
    rooms[roomId].addToChatHistory(data);
  }
}

export function sendReplyToCommand(socket: Socket, message: string) {
  socket.emit('messageCommandReturnStr', {
    message,
    classStr: 'server-text',
  });
}

export function destroyRoom(roomId) {
  if (rooms[roomId] === undefined || rooms[roomId] === null) {
    return;
  }

  quote.deleteRoomMessages(roomId);

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

  rooms[roomId].destructor();
  rooms[roomId] = undefined;

  console.log(`Destroyed room ${roomId}.`);
}

function playerLeaveRoomCheckDestroy(socket) {
  const roomId = socket.request.user.inRoomId;
  if (roomId && rooms[roomId]) {
    // leave the room
    rooms[roomId].playerLeaveRoom(socket);
    const toDestroy = rooms[roomId].destroyRoom;

    // if the game has started, wait to destroy to prevent lag spikes closing ongoing rooms
    if (toDestroy) {
      destroyRoom(roomId);
    }

    // if room is frozen for more than 5 mins then remove.
    if (
      rooms[roomId] &&
      rooms[roomId].timeFrozenLoaded &&
      rooms[roomId].getStatus() === 'Frozen' &&
      rooms[roomId].allSockets.length === 0
    ) {
      const curr = new Date();
      const timeToKill = 1000 * 60 * 5; // 5 mins
      if (
        curr.getTime() - rooms[roomId].timeFrozenLoaded.getTime() >
        timeToKill
      ) {
        destroyRoom(roomId);

        console.log(
          `Been more than ${
            timeToKill / 1000
          } seconds, removing this frozen game.`,
        );
      } else {
        console.log(
          `Frozen game has only loaded for ${
            (curr.getTime() - rooms[roomId].timeFrozenLoaded.getTime()) / 1000
          } seconds, Dont remove yet.`,
        );
      }
    }

    socket.request.user.inRoomId = undefined;

    updateCurrentGamesList();
  }
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

export function getIndexFromUsername(sockets, username, caseInsensitive) {
  username = username.split(' ')[0];
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

export function getSocketFromUsername(username: string): SocketUser {
  for (const socket of allSockets) {
    if (socket.request.user.username.toLowerCase() === username.toLowerCase()) {
      return socket;
    }
  }

  throw new Error(`Couldn't find socket for player ${username}.`);
}

function disconnect(data) {
  console.log(`${this.request.user.username} has left the lobby.`);

  chatSpamFilter.disconnectUser(this.request.user.username);

  allSockets.splice(allSockets.indexOf(this), 1);

  updateCurrentPlayersList();

  data = {
    message: `${this.request.user.username} has left the lobby.`,
    classStr: 'server-text-teal',
  };
  sendToAllChat(ioGlobal, data);

  // Note, by default when this disconnects, it leaves from all rooms.
  // If user disconnected from within a room, the leave room function will send a message to other players in room.

  const { username, inRoomId } = this.request.user;

  playerLeaveRoomCheckDestroy(this);

  matchmakingQueue.removeUser(username);
  sendNumPlayersInQueueToEveryone();

  // if they are in a room, say they're leaving the room.
  data = {
    message: `${username} has left the room.`,
    classStr: 'server-text-teal',
    dateCreated: new Date(),
  };
  sendToRoomChat(ioGlobal, inRoomId, data);
}

function messageCommand(data) {
  // Data contains: { command: string, args: string[] };
  // TODO This really shouldn't have to be done here.
  // Should consider passing this off to a dispatcher that can
  // apply the appropriate permission checks.

  let dataToSend = {};

  if (adminCommands[data.command] && isAdmin(this.request.user.username)) {
    adminCommands[data.command].run(data.args, this, ioGlobal);
  } else if (modCommands[data.command] && isMod(this.request.user.username)) {
    modCommands[data.command].run(data.args, this, ioGlobal);
  } else if (TOCommands[data.command] && isTO(this.request.user.username)) {
    dataToSend = TOCommands[data.command].run(data, this, ioGlobal);
  } else if (userCommands[data.command]) {
    dataToSend = userCommands[data.command].run(data, this, ioGlobal);
  } else {
    dataToSend = {
      message: 'Invalid command.',
      classStr: 'server-text',
      dateCreated: new Date(),
    };
  }

  this.emit('messageCommandReturnStr', dataToSend);
}

function interactUserPlayed(data) {
  if (!getIndexFromUsername(allSockets, data.myUsername.toLowerCase(), true)) {
    return;
  }
  if (possibleInteractsPast.indexOf(data.verbPast) === -1) {
    return;
  }

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

const prohibitedWords = [
  'nigger',
  'retard',
  'retarded',
  'tard',
  'chink',
  'fag',
  'fagg',
  'faggot',
  'tranny',
  'kys',
  'rape',
  'raped',
  'raper',
  'rapist',
  'raping',
];

function prohibitedChat(message) {
  const splitted = message.split(' ');
  for (let i = 0; i < splitted.length; i += 1) {
    const word = splitted[i].toLowerCase();
    const index = prohibitedWords.indexOf(word);
    if (index !== -1) {
      return true;
    }
  }

  return false;
}

function allChatFromClient(data) {
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

  // Apply chat filter
  if (prohibitedChat(data.message)) {
    const senderSocket =
      allSockets[getIndexFromUsername(allSockets, data.username, true)];
    const data2 = {
      message: 'You may not send a message that contains a prohibited word.',
      classStr: 'all-chat-text-red',
      dateCreated: new Date(),
    };
    senderSocket.emit('allChatToClient', data2);
    return;
  }

  if (!chatSpamFilter.chatRequest(data.username)) {
    outputSpamMessage('allChatToClient', data.username);
    return;
  }

  const senderSocket =
    allSockets[getIndexFromUsername(allSockets, data.username, true)];
  data.badge = senderSocket.request.badge;

  sendToAllChat(ioGlobal, data);
}

function roomChatFromClient(data) {
  if (this.request.user.inRoomId) {
    console.log(
      `[Room Chat] [Room ${this.request.user.inRoomId}] ${this.request.user.username}: ${data.message}`,
    );
  }
  // get the username and put it into the data object
  const validUsernames = getPlayerUsernamesFromAllSockets();

  data.username = this.request.displayUsername
    ? this.request.displayUsername
    : this.request.user.username;

  const senderSocket =
    allSockets[getIndexFromUsername(allSockets, data.username, true)];

  // if the username is not valid, i.e. one that they actually logged in as
  if (validUsernames.indexOf(this.request.user.username) === -1) {
    return;
  }

  data.message = textLengthFilter(data.message);
  // Apply chat filter
  if (prohibitedChat(data.message)) {
    const data2 = {
      message: 'You may not send a message that contains a prohibited word.',
      classStr: 'all-chat-text-red',
      dateCreated: new Date(),
    };
    senderSocket.emit('roomChatToClient', data2);
    return;
  }

  if (!chatSpamFilter.chatRequest(data.username)) {
    outputSpamMessage('roomChatToClient', data.username);
    return;
  }

  // Quotes
  const possibleQuotes = quote.rawChatToPossibleMessages(data.message);

  if (this.request.user.inRoomId) {
    const roomId = this.request.user.inRoomId;

    if (possibleQuotes.length > 0) {
      const validQuotes = possibleQuotes
        .map((possibleQuote) => quote.augmentIntoQuote(possibleQuote, roomId))
        .filter((validQuote) => validQuote) as MessageWithDate[];

      if (validQuotes.length > 0) {
        data.quotes = validQuotes;
      }
    } else {
      quote.addMessage(
        {
          username: data.username,
          message: data.message,
          date: new Date(),
        },
        roomId,
      );
    }
  }

  data.dateCreated = new Date();
  data.badge = senderSocket.request.badge;

  if (this.request.user.inRoomId) {
    const userRoom = rooms[this.request.user.inRoomId];

    if (userRoom && userRoom.canRoomChat(this.request.user.usernameLower)) {
      sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);
    } else {
      const msg = {
        message: 'The room is muted to spectators.',
        classStr: 'server-text',
        dateCreated: new Date(),
      };
      senderSocket.emit('roomChatToClient', msg);
    }
  }
}

function outputSpamMessage(chat, user) {
  const senderSocket = allSockets[getIndexFromUsername(allSockets, user, true)];
  const data3 = {
    message: 'You may not send too many messages in a short timespan.',
    classStr: 'all-chat-text-red',
    dateCreated: new Date(),
  };
  senderSocket.emit(chat, data3);
}

function newRoom(dataObj) {
  if (dataObj && !this.request.user.inRoomId) {
    const username = this.request.user.usernameLower;

    if (!createRoomFilter.createRoomRequest(username, rooms)) {
      return;
    }

    dataObj.maxNumPlayers = parseInt(dataObj.maxNumPlayers, 10);
    if (isNaN(dataObj.maxNumPlayers)) {
      return;
    }

    if (!isGameMode(dataObj.gameMode)) {
      return;
    }

    if (dataObj.ranked !== 'ranked' && dataObj.ranked !== 'unranked') {
      return;
    }

    if (dataObj.muteSpectators !== true && dataObj.muteSpectators !== false) {
      return;
    }

    if (
      dataObj.disableVoteHistory !== true &&
      dataObj.disableVoteHistory !== false
    ) {
      return;
    }

    // while rooms exist already (in case of a previously saved and retrieved game)
    while (rooms[nextRoomId]) {
      incrementNextRoomId();
    }

    const privateRoom = dataObj.newRoomPassword !== '';
    const rankedRoom = dataObj.ranked === 'ranked' && !privateRoom;

    const roomConfig = new RoomConfig(
      this.request.user.username,
      nextRoomId,
      ioGlobal,
      dataObj.maxNumPlayers,
      dataObj.newRoomPassword,
      strToGameMode(dataObj.gameMode),
      rankedRoom,
      readyPrompt,
    );
    const gameConfig = new GameConfig(
      roomConfig,
      dataObj.muteSpectators,
      dataObj.disableVoteHistory,
      RoomCreationType.CUSTOM_ROOM,
      () => new Date(),
    );

    rooms[nextRoomId] = new GameWrapper(gameConfig, socketCallback);

    const privateStr = !privateRoom ? '' : 'private ';
    const rankedUnrankedStr = rankedRoom ? 'ranked' : 'unranked';

    const data = {
      message: `${this.request.user.username} has created ${rankedUnrankedStr} ${privateStr}room ${nextRoomId}.`,
      classStr: 'server-text',
    };
    sendToAllChat(ioGlobal, data);

    // send to allChat including the host of the game
    // ioGlobal.in("allChat").emit("new-game-created", str);
    // send back room id to host so they can auto connect
    this.emit('auto-join-room-id', nextRoomId, dataObj.newRoomPassword);

    // increment index for next game
    incrementNextRoomId();
    updateCurrentGamesList();
  }
}

function joinRoom(roomId, inputPassword) {
  // console.log("inputpassword: " + inputPassword);

  // if the room exists and the player is not currently in a room
  if (rooms[roomId] && !this.request.user.inRoomId) {
    // join the room
    if (rooms[roomId].playerJoinRoom(this, inputPassword) === true) {
      // sends to players and specs
      rooms[roomId].distributeGameData();

      // set the room id into this obj
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

      // Send room chat to client
      this.emit('roomChatToClient', rooms[roomId].chatHistory);
    }
  } else {
    // console.log("Game doesn't exist!");
  }
}

function joinGame(roomId) {
  if (rooms[roomId] && this.request.user.inRoomId === roomId) {
    if (rooms[roomId].getStatus() === 'Waiting') {
      rooms[roomId].playerSitDown(this);
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
      `${this.request.user.username} is leaving room: ${this.request.user.inRoomId}`,
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

function startGame(data) {
  if (!data) {
    return;
  }

  const options = data.options;
  const gameMode = data.gameMode;
  const timeoutsStr = data.timeouts;

  // start the game
  if (gameMode === null || gameMode === undefined) {
    this.emit(
      'danger-alert',
      'Something went wrong. Cannot detect game mode specified.',
    );
    return;
  }

  const processTimeout = (timeoutStr: string) => {
    let timeout = parseInt(timeoutStr, 10);
    if (timeout < 0) {
      timeout = 0;
    }

    return timeout;
  };

  const timeouts = {
    default: processTimeout(timeoutsStr.default),
    assassination: processTimeout(timeoutsStr.assassination),
  };

  if (
    rooms[this.request.user.inRoomId] &&
    rooms[this.request.user.inRoomId].host === this.request.user.username
  ) {
    rooms[this.request.user.inRoomId].configureTimeouts(timeouts);
    rooms[this.request.user.inRoomId].hostTryStartGame(
      options,
      gameMode,
      timeouts,
    );
  }
}

function kickPlayer(username: string): void {
  console.log(`received kick player request: ${username}`);
  if (rooms[this.request.user.inRoomId]) {
    rooms[this.request.user.inRoomId].kickPlayer(username, this);
  }
}

function joinQueue() {
  const username = this.request.user.username;
  const blacklistUsernames = this.request.user.matchmakingBlacklist;

  if (!joinQueueFilter.joinQueueRequest(username)) {
    this.emit('allChatToClient', {
      message:
        'You have rejected too many found matches. Please try again later.',
      classStr: 'server-text',
    });
    return;
  }

  if (process.env.ENV !== 'local') {
    if (this.request.user.totalGamesPlayed < 3) {
      this.emit('danger-alert', 'You require 3 games to join the ranked queue.');
      return;
    }
  }

  const result = matchmakingQueue.addUser(
    new QueueEntry(username, blacklistUsernames),
  );
  if (result) {
    this.emit('allChatToClient', {
      message: 'You have been added to the queue.',
      classStr: 'server-text',
    });

    sendNumPlayersInQueueToEveryone();
  } else {
    this.emit('allChatToClient', {
      message: 'You have already joined the queue.',
      classStr: 'server-text',
    });
  }
}

function leaveQueue(): void {
  const username = this.request.user.username;
  const result = matchmakingQueue.removeUser(username);

  this.emit('allChatToClient', {
    message: result
      ? 'You have been removed from the queue.'
      : 'You are not in the queue.',
    classStr: 'server-text',
  });

  sendNumPlayersInQueueToEveryone();
}

function sendNumPlayersInQueueToEveryone() {
  allSockets.forEach((sock) => {
    sock.emit('numPlayersInQueue', {
      numPlayersInQueue: matchmakingQueue.getNumInQueue(),
    });
  });
}

function readyPromptHandler(reply: ReadyPromptReplyFromClient): void {
  const username = this.request.user.username;

  readyPrompt.clientReply(username, reply);
}

function matchFound(usernames: string[]): void {
  const sockets = [];
  for (const username of usernames) {
    sockets.push(getSocketFromUsername(username));
  }

  readyPrompt.createReadyPrompt(
    sockets,
    'Match found!',
    '',
    (
      success: boolean,
      approvedUsernames: string[],
      rejectedUsernames: string[],
    ): void => {
      if (!success) {
        // Throw approved users back into queue.
        for (const username of approvedUsernames) {
          matchmakingQueue.addUser(
            new QueueEntry(
              username,
              getSocketFromUsername(username).request.user.matchmakingBlacklist,
            ),
          );

          const socket = getSocketFromUsername(username);
          socket.emit('allChatToClient', {
            message:
              "A player didn't accept the match. You have been re-added to the queue.",
            classStr: 'server-text',
          });
        }

        for (const username of rejectedUsernames) {
          joinQueueFilter.registerReject(username);

          const socket = getSocketFromUsername(username);
          socket.emit('allChatToClient', {
            message:
              'You did not accept the match. You have been removed from the queue.',
            classStr: 'server-text',
          });
        }

        sendNumPlayersInQueueToEveryone();
        return;
      }

      // We have a match! Create the room.
      // while rooms exist already (in case of a previously saved and retrieved game)
      while (rooms[nextRoomId]) {
        incrementNextRoomId();
      }

      const roomConfig = new RoomConfig(
        approvedUsernames[0],
        nextRoomId,
        ioGlobal,
        10,
        undefined,
        GameMode.AVALON,
        true,
        readyPrompt,
      );
      const gameConfig = new GameConfig(
        roomConfig,
        false,
        false,
        RoomCreationType.QUEUE,
        () => new Date(),
      );

      rooms[nextRoomId] = new GameWrapper(gameConfig, socketCallback);
      const room = rooms[nextRoomId];

      room.configureTimeouts({
        default: 3 * 60 * 1000,
        assassination: 15 * 60 * 1000,
      });

      for (const username of approvedUsernames) {
        room.playerJoinRoom(getSocketFromUsername(username));
        room.playerSitDown(getSocketFromUsername(username));
      }

      room.startGame([Role.Merlin, Role.Percival, Role.Assassin, Role.Morgana]);

      // Need to push them out so that the game treats them as just joining to
      // send data, etc.
      for (const username of approvedUsernames) {
        room.playerLeaveRoom(getSocketFromUsername(username));
      }

      for (const username of approvedUsernames) {
        getSocketFromUsername(username).emit('match-found-join-room', {
          roomId: nextRoomId,
        });
      }

      const data = {
        message: `Server has created ranked room ${nextRoomId}.`,
        classStr: 'server-text',
      };
      sendToAllChat(ioGlobal, data);

      incrementNextRoomId();
      updateCurrentGamesList();
    },
  );
}

function setClaim(data) {
  if (rooms[this.request.user.inRoomId]) {
    rooms[this.request.user.inRoomId].setClaim(this, data);
  }
}

function gameMove(data) {
  if (rooms[this.request.user.inRoomId]) {
    rooms[this.request.user.inRoomId].gameMove(this, data);
  }

  if (rooms[this.request.user.inRoomId]) {
    postGameMoveChecks(rooms[this.request.user.inRoomId]);
  }
}

export function postGameMoveChecks(room: Game) {
  if (room.finished === true) {
    deleteSaveGameFromDb(room);
  } else {
    if (room.requireSave) {
      room.requireSave = false;
      saveGameToDb(room);
      console.log(`Saving game ${room.roomId}`);
    }
  }
}

function updateRoomGameMode(gameMode: GameMode) {
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

function updateRoomMuteSpectators(muteSpectators) {
  if (rooms[this.request.user.inRoomId]) {
    rooms[this.request.user.inRoomId].updateMuteSpectators(muteSpectators);
  }
}

function updateRoomDisableVoteHistory(disableVoteHistory) {
  if (rooms[this.request.user.inRoomId]) {
    rooms[this.request.user.inRoomId].updateDisableVoteHistory(
      disableVoteHistory,
    );
  }
}

function updateRoomMaxPlayers(number) {
  if (rooms[this.request.user.inRoomId]) {
    rooms[this.request.user.inRoomId].updateMaxNumPlayers(this, number);
  }
  updateCurrentGamesList();
}

export const GetLastFiveMinsAllChat = () => {
  return allChat5Min;
};

export const GetUserCurrentRoom = (username: string) => {
  return allSockets[getIndexFromUsername(allSockets, username, true)].request
    .user.inRoomId;
};

export const DisconnectUserSocket = (username: string): bool => {
  const index = getIndexFromUsername(allSockets, username, true);
  if (!index) {
    return false;
  }

  const targetSocket = allSockets[index];
  targetSocket.disconnect(true);
  return true;
};

export const GetRoomChat = (roomId: number) => {
  return rooms[roomId].chatHistory;
};

export const GetRoom = (roomId: number) => {
  return rooms[roomId];
};
