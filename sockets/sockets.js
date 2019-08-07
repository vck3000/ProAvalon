//sockets
var gameRoom = require("../gameplay/game");
const axios = require('axios');

var savedGameObj = require("../models/savedGame");
var modAction = require("../models/modAction");
var currentModActions = [];
var myNotification = require("../models/notification");
var createNotificationObj = require("../myFunctions/createNotification");

var getRewards = require("../rewards/getRewards");
var getRewardsObj = new getRewards();

const REWARDS = require("../rewards/constants");

var avatarRequest = require("../models/avatarRequest");
var User = require("../models/user");
var banIp = require("../models/banIp");
const JSON = require('circular-json');
var modsArray = require("../modsadmins/mods");
var adminsArray = require("../modsadmins/admins");

const _bot = require("./bot");
const enabledBots = _bot.enabledBots;
const makeBotAPIRequest = _bot.makeBotAPIRequest;
const SimpleBotSocket = _bot.SimpleBotSocket;
const APIBotSocket = _bot.APIBotSocket;

const dateResetRequired = 1543480412695;

const newUpdateNotificationRequired = 1557512579418;
const updateMessage = `

<h1>BOTS HAVE HIT THE ROADS FELLAS!</h1>

<br>

Make sure you select avalonBot gameMode. <br> Check out /help to see commands to interact with bots.

<br>
<br>

Thanks guys, and in particular Detry322 for making this possible!
`;

var allSockets = [];
var rooms = [];

//retain only 5 mins.
var allChatHistory = [];
var allChat5Min = [];

var nextRoomId = 1;

// Get all the possible gameModes
var fs = require("fs");
var gameModeNames = [];
fs.readdirSync("./gameplay/").filter(function (file) {
	if (fs.statSync("./gameplay" + '/' + file).isDirectory() === true && file !== "commonPhases") {
		gameModeNames.push(file);
	}
});

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
	sendWarning();

	console.log("Graceful shutdown request");
	process.exit();
}


function sendWarning() {
	for (var key in allSockets) {
		if (allSockets.hasOwnProperty(key)) {
			allSockets[key].emit("serverRestartingNow");
		}
	}
}

function saveGameToDb(roomToSave) {
	if (roomToSave.gameStarted === true && roomToSave.finished !== true) {
		if (roomToSave.savedGameRecordId === undefined) {
			savedGameObj.create({ room: JSON.stringify(roomToSave) }, function (err, savedGame) {
				if (err) {
					console.log(err);
				}
				else {
					rooms[rooms.indexOf(roomToSave)].savedGameRecordId = savedGame.id;
					// console.log("Successfully created this save game");
				}
			});
		}
		else {
			savedGameObj.findByIdAndUpdate(roomToSave.savedGameRecordId, { room: JSON.stringify(roomToSave) }, function (err, savedGame) {
				// console.log("Successfully saved this game");
			});
		}
	}
}
function deleteSaveGameFromDb(room) {
	savedGameObj.findByIdAndRemove(room.savedGameRecordId, function (err) {
		if (err) {
			console.log(err);
		}
		else {
			// console.log("Successfully removed this save game from db");
		}
	});
}


// RECOVERING SAVED GAMES!
savedGameObj.find({}).exec(function (err, foundSaveGameArray) {
	if (err) { console.log(err); }
	else {
		for (var key in foundSaveGameArray) {
			if (foundSaveGameArray.hasOwnProperty(key)) {
				var foundSaveGame = foundSaveGameArray[key];

				if (foundSaveGame) {
					var storedData = JSON.parse(foundSaveGame.room);

					rooms[storedData["roomId"]] = new gameRoom();

					Object.assign(rooms[storedData["roomId"]], storedData);

					rooms[storedData["roomId"]].restartSaved = true;
					rooms[storedData["roomId"]].savedGameRecordId = foundSaveGame.id;
					rooms[storedData["roomId"]].recoverGame(storedData);
				}
			}
		}
	}
});

var lastWhisperObj = {};
var actionsObj = {
	userCommands: {
		help: {
			command: "help",
			help: "/help: ...shows help",
			run: function (data) {
				//do stuff

				var dataToReturn = [];
				var i = 0;

				i++;

				for (var key in actionsObj.userCommands) {
					if (actionsObj.userCommands.hasOwnProperty(key)) {
						if (!actionsObj.userCommands[key].modsOnly) {
							dataToReturn[i] = { message: actionsObj.userCommands[key].help, classStr: "server-text", dateCreated: new Date() };
							i++;
						}
					}
				}
				return dataToReturn;
			}
		},

		buzz: {
			command: "buzz",
			help: "/buzz <playername>: Buzz a player.",
			run: function (data, senderSocket) {
				var args = data.args;

				data.args[2] = data.args[1];
				data.args[1] = "buzz";

				return actionsObj.userCommands.interactUser.run(data, senderSocket);
			}
		},

		slap: {
			command: "slap",
			help: "/slap <playername>: Slap a player for fun.",
			run: function (data, senderSocket) {
				var args = data.args;

				data.args[2] = data.args[1];
				data.args[1] = "slap";

				return actionsObj.userCommands.interactUser.run(data, senderSocket);
			}
		},

		lick: {
			command: "lick",
			help: "/lick <playername>: Lick a player.",
			run: function (data, senderSocket) {
				var args = data.args;

				data.args[2] = data.args[1];
				data.args[1] = "lick";

				return actionsObj.userCommands.interactUser.run(data, senderSocket);
			}
		},
		poke: {
			command: "poke",
			help: "/poke <playername>: poke a player.",
			run: function (data, senderSocket) {
				var args = data.args;

				data.args[2] = data.args[1];
				data.args[1] = "poke";

				return actionsObj.userCommands.interactUser.run(data, senderSocket);
			}
		},
		punch: {
			command: "punch",
			help: "/punch <playername>: punch a player.",
			run: function (data, senderSocket) {
				var args = data.args;

				data.args[2] = data.args[1];
				data.args[1] = "punch";

				return actionsObj.userCommands.interactUser.run(data, senderSocket);
			}
		},
		interactUser: {
			command: "interactUser",
			help: "/interactUser <slap/buzz/lick> <playername>: Interact with a player.",
			run: function (data, senderSocket) {
				var args = data.args;

				var possibleInteracts = ["buzz", "slap", "lick", "poke", "punch"];
				if (possibleInteracts.indexOf(args[1]) === -1) {
					return { message: "You can only slap, buzz, poke, punch or lick, not " + args[1] + ".", classStr: "server-text", dateCreated: new Date() };
				}

				var slapSocket = allSockets[getIndexFromUsername(allSockets, args[2], true)];
				if (slapSocket) {

					var verbPast = "";
					if (args[1] === "buzz") { verbPast = "buzzed"; }
					else if (args[1] === "slap") { verbPast = "slapped"; }
					else if (args[1] === "lick") { verbPast = "licked"; }
					else if (args[1] === "poke") { verbPast = "poked"; }
					else if (args[1] === "punch") { verbPast = "punched"; }

					var dataToSend = {
						username: senderSocket.request.user.username,
						verb: args[1],
						verbPast: verbPast
					}
					slapSocket.emit("interactUser", dataToSend);


					//if the sendersocket is in a game, then send a message to everyone in the game.
					var slappedInGame = false;
					var socketThatWasSlappedInGame = undefined;
					//need to know which person is in the room, if theyre both then it doesnt matter who.
					if (senderSocket.request.user.inRoomId && rooms[senderSocket.request.user.inRoomId] && rooms[senderSocket.request.user.inRoomId].gameStarted === true) {
						slappedInGame = true;
						socketThatWasSlappedInGame = senderSocket;
					}
					else if (slapSocket.request.user.inRoomId && rooms[slapSocket.request.user.inRoomId] && rooms[slapSocket.request.user.inRoomId].gameStarted === true) {
						slappedInGame = true;
						socketThatWasSlappedInGame = slapSocket;
					}

					if (slappedInGame === true) {
						var str = senderSocket.request.user.username + " has " + verbPast + " " + slapSocket.request.user.username + ". (In game)";
						rooms[socketThatWasSlappedInGame.request.user.inRoomId].sendText(rooms[socketThatWasSlappedInGame.request.user.inRoomId].allSockets, str, "server-text");
					}

					return; // {message: "You have " + verbPast + " " + args[2] + "!", classStr: "server-text"};
				}
				else {
					// console.log(allSockets);
					return { message: "There is no such player.", classStr: "server-text" };
				}
			}
		},

		roomchat: {
			command: "roomchat",
			help: "/roomchat: Get a copy of the chat for the current game.",
			run: function (data, senderSocket) {
				var args = data.args;
				//code
				if (rooms[senderSocket.request.user.inRoomId] && rooms[senderSocket.request.user.inRoomId].gameStarted === true) {
					return rooms[senderSocket.request.user.inRoomId].chatHistory;
				}
				else {
					return { message: "The game hasn't started yet. There is no chat to display.", classStr: "server-text" }
				}
			}
		},

		allchat: {
			command: "allchat",
			help: "/allchat: Get a copy of the last 5 minutes of allchat.",
			run: function (data, senderSocket) {
				//code
				var args = data.args;
				return allChat5Min;
			}
		},

		roll: {
			command: "roll",
			help: "/roll <optional number>: Returns a random number between 1 and 10 or 1 and optional number.",
			run: function (data, senderSocket) {
				var args = data.args;

				//code
				if (args[1]) {
					if (isNaN(args[1]) === false) {
						return { message: (Math.floor(Math.random() * args[1]) + 1).toString(), classStr: "server-text" }
					}
					else {
						return { message: "That is not a valid number!", classStr: "server-text" }
					}
				}
				else {
					return { message: (Math.floor(Math.random() * 10) + 1).toString(), classStr: "server-text" }
				}
			}
		},

		mute: {
			command: "mute",
			help: "/mute: Mute a player who is being annoying in chat/buzzing/slapping/licking/poking/tickling you.",
			run: function (data, senderSocket) {
				var args = data.args;

				if (args[1]) {
					User.findOne({ username: args[1] }).exec(function (err, foundUserToMute) {
						if (err) { console.log(err); }
						else {
							if (foundUserToMute) {
								User.findOne({ username: senderSocket.request.user.username }).exec(function (err, userCallingMute) {
									if (err) { console.log(err); }
									else {
										if (userCallingMute) {
											if (!userCallingMute.mutedPlayers) {
												userCallingMute.mutedPlayers = [];
											}
											if (userCallingMute.mutedPlayers.indexOf(foundUserToMute.username) === -1) {
												userCallingMute.mutedPlayers.push(foundUserToMute.username);
												userCallingMute.markModified("mutedPlayers");
												userCallingMute.save();
												senderSocket.emit("updateMutedPlayers", userCallingMute.mutedPlayers);
												senderSocket.emit("messageCommandReturnStr", { message: "Muted " + args[1] + " successfully.", classStr: "server-text" });
											}
											else {
												senderSocket.emit("messageCommandReturnStr", { message: "You have already muted " + args[1] + ".", classStr: "server-text" });
											}

										}
									}
								});
							}
							else {
								senderSocket.emit("messageCommandReturnStr", { message: args[1] + " was not found.", classStr: "server-text" });
								return;
							}
						}
					});
				}
			}
		},

		unmute: {
			command: "unmute",
			help: "/unmute: Unmute a player.",
			run: function (data, senderSocket) {
				var args = data.args;

				if (args[1]) {
					User.findOne({ username: senderSocket.request.user.username }).exec(function (err, foundUser) {
						if (err) { console.log(err); }
						else {
							if (foundUser) {
								if (!foundUser.mutedPlayers) {
									foundUser.mutedPlayers = [];
								}
								var index = foundUser.mutedPlayers.indexOf(args[1]);

								if (index !== -1) {
									foundUser.mutedPlayers.splice(index, 1);
									foundUser.markModified("mutedPlayers");
									foundUser.save();

									senderSocket.emit("updateMutedPlayers", foundUser.mutedPlayers);
									senderSocket.emit("messageCommandReturnStr", { message: "Unmuted " + args[1] + " successfully.", classStr: "server-text" });
								}
								else {
									senderSocket.emit("messageCommandReturnStr", { message: "Could not find " + args[1] + ".", classStr: "server-text" });
								}
							}
						}
					});
				}
				else {
					senderSocket.emit("messageCommandReturnStr", { message: args[1] + " was not found or was not muted from the start.", classStr: "server-text" });
					return;
				}
			}
		},

		getmutedplayers: {
			command: "getmutedplayers",
			help: "/getmutedplayers: See who you have muted.",
			run: function (data, senderSocket) {
				var args = data.args;

				if (args[1] === senderSocket.request.user.username) {
					senderSocket.emit("messageCommandReturnStr", { message: "Why would you mute yourself...?", classStr: "server-text" });
					return;
				}

				User.findOne({ username: senderSocket.request.user.username }).exec(function (err, foundUser) {
					if (err) { console.log(err); }
					else {
						if (foundUser) {
							if (!foundUser.mutedPlayers) {
								foundUser.mutedPlayers = [];
							}

							var dataToReturn = [];
							dataToReturn[0] = { message: "Muted players:", classStr: "server-text" };

							for (var i = 0; i < foundUser.mutedPlayers.length; i++) {
								dataToReturn[i + 1] = { message: "-" + foundUser.mutedPlayers[i], classStr: "server-text" };
							}
							if (dataToReturn.length === 1) {
								dataToReturn[0] = { message: "You have no muted players.", classStr: "server-text" }
							}

							// console.log(dataToReturn);

							senderSocket.emit("messageCommandReturnStr", dataToReturn);

						}
					}
				});
			}
		},

		navbar: {
			command: "navbar",
			help: "/navbar: Hides and unhides the top navbar. Some phone screens may look better with the navbar turned off.",
			run: function (data, senderSocket) {
				var args = data.args;
				senderSocket.emit("toggleNavBar");
			}
		},

		avatarshow: {
			command: "avatarshow",
			help: "/avatarshow: Show your custom avatar!",
			run: function (data, senderSocket) {

				User.findOne({ usernameLower: senderSocket.request.user.username.toLowerCase() }).populate("notifications").exec(function (err, foundUser) {
					foundUser.avatarHide = false;
					foundUser.save();

					var dataToReturn = {
						message: "Successfully unhidden.",
						classStr: "server-text"
					}

					senderSocket.emit("messageCommandReturnStr", dataToReturn);
				});
			}
		},
		avatarhide: {
			command: "avatarhide",
			help: "/avatarhide: Hide your custom avatar.",
			run: function (data, senderSocket) {
				User.findOne({ usernameLower: senderSocket.request.user.username.toLowerCase() }).populate("notifications").exec(function (err, foundUser) {
					foundUser.avatarHide = true;
					foundUser.save();

					var dataToReturn = {
						message: "Successfully hidden.",
						classStr: "server-text"
					}

					senderSocket.emit("messageCommandReturnStr", dataToReturn);
				});



			}
		},
		r: {
			command: "r",
			help: "/r: Reply to a mod who just messaged you.",
			run: function (data, senderSocket) {

				var args = data.args;
				var str = senderSocket.request.user.username + "->" + lastWhisperObj[senderSocket.request.user.username] + " (whisper): ";
				for (var i = 1; i < args.length; i++) {
					str += args[i];
					str += " ";
				}

				// str += ("(From: " + senderSocket.request.user.username + ")");

				var dataMessage = {
					message: str,
					dateCreated: new Date(),
					classStr: "whisper"
				};

				//this sendToSocket is the moderator
				var sendToSocket = allSockets[getIndexFromUsername(allSockets, lastWhisperObj[senderSocket.request.user.username], true)];

				if (!sendToSocket) {
					senderSocket.emit("messageCommandReturnStr", { message: "You haven't been whispered to before.", classStr: "server-text" });
				}
				else {
					sendToSocket.emit("allChatToClient", dataMessage);
					sendToSocket.emit("roomChatToClient", dataMessage);

					//set the last whisper person
					lastWhisperObj[sendToSocket.request.user.username] = senderSocket.request.user.username;

					lastWhisperObj[senderSocket.request.user.username] = sendToSocket.request.user.username;

					senderSocket.emit("allChatToClient", dataMessage);
					senderSocket.emit("roomChatToClient", dataMessage);
				}
				return;
			}
		},
		guessmerlin: {
			command: "guessmerlin",
			help: "/guessmerlin <playername>: Solely for fun, submit your guess of who you think is Merlin.",
			run: function (data, senderSocket) {
				// Check the guesser is at a table
				if (senderSocket.request.user.inRoomId === undefined
					|| rooms[senderSocket.request.user.inRoomId].gameStarted !== true
					|| rooms[senderSocket.request.user.inRoomId].phase === "finished") {
					messageToClient = "You must be at a running table to guess Merlin.";
				}
				else {
					messageToClient = rooms[senderSocket.request.user.inRoomId].submitMerlinGuess(senderSocket.request.user.username, data.args[1]);
				}

				return { message: messageToClient, classStr: "server-text noselect" };
			}
		},
		gm: {
			command: "gm",
			help: "/gm <playername>: Shortcut for /guessmerlin",
			run: function (data, senderSocket) {
				return actionsObj.userCommands.guessmerlin.run(data, senderSocket);
			}
		},

		getbots: {
			command: "getbots",
			help: "/getbots: Run this in a bot-compatible room. Prints a list of available bots to add, as well as their supported game modes",
			run: function (data, senderSocket) {
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

				senderSocket.emit("messageCommandReturnStr", {
					message: "Fetching bots...",
					classStr: "server-text"
				});

				var botInfoRequests = enabledBots.map(function (botAPI) {
					return makeBotAPIRequest(botAPI, 'GET', '/v0/info', {}, 2000).then(function (response) {
						if (response.status !== 200) {
							return null;
						}
						return {
							name: botAPI.name,
							info: response.data
						}
					}).catch(function (response) {
						return null;
					});
				});

				axios.all(botInfoRequests).then(function (botInfoResponses) {
					var botDescriptions = botInfoResponses.filter(function (result) {
						return result != null;
					}).map(function (result) {
						return result.name + " - " + JSON.stringify(result.info.capabilities);
					});

					// Hard code this in... (unshift pushes to the start of the array)
					botDescriptions.unshift("SimpleBot - Random playing bot...");

					if (botDescriptions.length === 0) {
						senderSocket.emit("messageCommandReturnStr", {
							message: "No bots are currently available.",
							classStr: "server-text"
						});
					} else {
						var messages = ["The following bots are online:"].concat(botDescriptions);
						senderSocket.emit("messageCommandReturnStr", messages.map(function (message) {
							return {
								message: message,
								classStr: "server-text"
							}
						}));
					}
				});
			}
		},

		addbot: {
			command: "addbot",
			help: "/addbot <name> [number]: Run this in a bot-compatible room. Add a bot to the room.",
			run: function (data, senderSocket) {
				if (senderSocket.request.user.inRoomId === undefined || rooms[senderSocket.request.user.inRoomId] === undefined) {
					return {
						message: "You must be in a bot-capable room to run this command!",
						classStr: "server-text"
					};
				} else if (rooms[senderSocket.request.user.inRoomId].gameMode.toLowerCase().includes("bot") === false) {
					return {
						message: "This room is not bot capable. Please join a bot-capable room.",
						classStr: "server-text"
					}
				} else if (rooms[senderSocket.request.user.inRoomId].host !== senderSocket.request.user.username) {
					return {
						message: "You are not the host.",
						classStr: "server-text"
					}
				}

				var currentRoomId = senderSocket.request.user.inRoomId;
				var currentRoom = rooms[currentRoomId];

				if (currentRoom.gameStarted === true || currentRoom.canJoin === false) {
					return {
						message: "No bots can join this room at this time.",
						classStr: "server-text"
					}
				}

				var args = data.args;

				if (!args[1]) {
					return {
						message: "Specify a bot. Use /getbots to see online bots.",
						classStr: "server-text"
					};
				}
				var botName = args[1];
				var botAPI = enabledBots.find(function (bot) { return bot.name.toLowerCase() === botName.toLowerCase() });
				if (!botAPI && botName !== "SimpleBot") {
					return {
						message: "Couldn't find a bot called " + botName + ".",
						classStr: "server-text"
					}
				}

				var numBots = +args[2] || 1;

				if (currentRoom.socketsOfPlayers.length + numBots > currentRoom.maxNumPlayers) {
					return {
						message: "Adding " + numBots + " bot(s) would make this room too full.",
						classStr: "server-text"
					}
				}

				var addedBots = [];
				for (var i = 0; i < numBots; i++) {
					var botName = botAPI.name + "#" + Math.floor(Math.random() * 100);

					// Avoid a username clash!
					var currentUsernames = currentRoom.socketsOfPlayers.map(function (sock) { return sock.request.user.username; });
					if (currentUsernames.includes(botName)) {
						i--;
						continue;
					}

					var dummySocket;
					if (botAPI.name == "SimpleBot") {
						dummySocket = new SimpleBotSocket(botName);
					}
					else {
						dummySocket = new APIBotSocket(botName, botAPI);
					}

					currentRoom.playerJoinRoom(dummySocket);
					currentRoom.playerSitDown(dummySocket);
					if (!currentRoom.botSockets) {
						currentRoom.botSockets = [];
					}
					currentRoom.botSockets.push(dummySocket);
					addedBots.push(botName)
				}

				if (addedBots.length > 0) {
					sendToRoomChat(ioGlobal, currentRoomId, {
						message: senderSocket.request.user.username + " added bots to this room: " + addedBots.join(', '),
						classStr: "server-text-teal"
					});
				}

			}
		},
		rembot: {
			command: "rembot",
			help: "/rembot (<name>|all): Run this in a bot-compatible room. Removes a bot from the room.",
			run: function (data, senderSocket) {
				if (senderSocket.request.user.inRoomId === undefined || rooms[senderSocket.request.user.inRoomId] === undefined) {
					return {
						message: "You must be in a bot-capable room to run this command!",
						classStr: "server-text"
					};
				} else if (rooms[senderSocket.request.user.inRoomId].gameMode.toLowerCase().includes("bot") === false) {
					return {
						message: "This room is not bot capable. Please join a bot-capable room.",
						classStr: "server-text"
					}
				} else if (rooms[senderSocket.request.user.inRoomId].host !== senderSocket.request.user.username) {
					return {
						message: "You are not the host.",
						classStr: "server-text"
					}
				}

				var currentRoomId = senderSocket.request.user.inRoomId;
				var currentRoom = rooms[currentRoomId];
				var args = data.args;

				if (currentRoom.gameStarted === true || currentRoom.canJoin === false) {
					return {
						message: "No bots can be removed from this room at this time.",
						classStr: "server-text"
					}
				}

				if (!args[1]) {
					return {
						message: "Specify a bot to remove, or use \"/rembot all\" to remove all bots.",
						classStr: "server-text"
					};
				}
				var botName = args[1];
				var botSockets = currentRoom.botSockets.slice() || [];
				var botsToRemove = (botName === 'all')
					? botSockets
					: botSockets.filter(function (socket) {
						return socket.request.user.username.toLowerCase() === botName.toLowerCase()
					});
				if (botsToRemove.length === 0) {
					return {
						message: "Couldn't find any bots with that name to remove.",
						classStr: "server-text"
					};
				}

				botsToRemove.forEach(function (botSocket) {
					currentRoom.playerLeaveRoom(botSocket);

					if (currentRoom.botSockets && currentRoom.botSockets.indexOf(botSocket) !== -1) {
						currentRoom.botSockets.splice(currentRoom.botSockets.indexOf(botSocket), 1);
					}
				});

				var removedBots = botsToRemove.map(function (botSocket) { return botSocket.request.user.username });
				sendToRoomChat(ioGlobal, currentRoomId, {
					message: senderSocket.request.user.username + " removed bots from this room: " + removedBots.join(', '),
					classStr: "server-text-teal"
				});
			}
		}
	},


	modCommands: {
		m: {
			command: "m",
			help: "/m: displays /mhelp",
			run: function (data, senderSocket) {

				return actionsObj.modCommands["mhelp"].run(data, senderSocket);
			}
		},
		mban: {
			command: "mban",
			help: "/mban: Open the ban interface",
			run: function (data, senderSocket) {

				// console.log(senderSocket.request.user.username);
				if (modsArray.indexOf(senderSocket.request.user.username.toLowerCase()) !== -1) {
					senderSocket.emit("openModModal");
					return { message: "May your judgement bring peace to all!", classStr: "server-text" };
				}
				else {
					//add a report to this player.
					return { message: "You are not a mod. Why are you trying this...", classStr: "server-text" };
				}
			}
		},
		mipban: {
			command: "mipban",
			help: "/mipban <username>: Ban the IP of the player given. /munban does not undo this ban. Contact ProNub to remove an IP ban.",
			run: function (data, senderSocket) {
				var args = data.args;

				if (!args[1]) {
					senderSocket.emit("messageCommandReturnStr", { message: "Specify a username", classStr: "server-text" });
					return { message: "Specify a username.", classStr: "server-text" };
				}

				User.find({ usernameLower: senderSocket.request.user.username.toLowerCase() }).populate("notifications").exec(function (err, foundUser) {
					if (err) { console.log(err); }
					else if (foundUser) {

						var slapSocket = allSockets[getIndexFromUsername(allSockets, args[1], true)];
						if (slapSocket) {
							var clientIpAddress = slapSocket.request.headers['x-forwarded-for'] || slapSocket.request.connection.remoteAddress;

							var banIpData = {
								type: "ip",
								bannedIp: clientIpAddress,
								usernamesAssociated: [args[1].toLowerCase()],
								modWhoBanned: { id: foundUser._id, username: foundUser.username },
								whenMade: new Date(),
							}

							banIp.create(banIpData, function (err, newBan) {
								if (err) { console.log(err); }
								else {
									allSockets[getIndexFromUsername(allSockets, args[1].toLowerCase(), true)].disconnect(true);

									senderSocket.emit("messageCommandReturnStr", { message: "Successfully ip banned user " + args[1], classStr: "server-text" });
								}
							});
						}
						else {
							senderSocket.emit("messageCommandReturnStr", { message: "Could not find the player to ban.", classStr: "server-text" });
						}
					}

					else {
						//send error message back
						senderSocket.emit("messageCommandReturnStr", { message: "Could not find your user data (your own one, not the person you're trying to ban)", classStr: "server-text" });
					}

				});

			}
		},
		mhelp: {
			command: "mhelp",
			help: "/mhelp: show commands.",
			run: function (data, senderSocket) {
				var args = data.args;
				//do stuff
				var dataToReturn = [];
				var i = 0;
				i++;

				for (var key in actionsObj.modCommands) {
					if (actionsObj.modCommands.hasOwnProperty(key)) {
						if (!actionsObj.modCommands[key].modsOnly) {
							// console.log(key + " -> " + p[key]);
							dataToReturn[i] = { message: actionsObj.modCommands[key].help, classStr: "server-text" };
							// str[i] = userCommands[key].help;
							i++;
							//create a break in the chat
							// data[i] = {message: "-------------------------", classStr: "server-text"};
							// i++;
						}
					}
				}
				return dataToReturn;

			}
		},
		munban: {
			command: "munban",
			help: "/munban <player name>: Removes ALL existing bans OR mutes on a player's name.",
			run: async function (data, senderSocket) {
				var args = data.args;

				if (!args[1]) {
					return { message: "Specify a username.", classStr: "server-text" }
				}

				modAction.find({ 'bannedPlayer.usernameLower': args[1].toLowerCase() }, function (err, foundModAction) {
					// console.log("foundmodaction");
					// console.log(foundModAction);
					if (foundModAction.length !== 0) {
						modAction.remove({ 'bannedPlayer.usernameLower': args[1].toLowerCase() }, function (err, foundModAction) {
							if (err) {
								console.log(err);
								senderSocket.emit("messageCommandReturnStr", { message: "Something went wrong.", classStr: "server-text" });
							}
							else {
								// console.log("Successfully unbanned " + args[1] + ".");
								senderSocket.emit("messageCommandReturnStr", { message: "Successfully unbanned " + args[1] + ".", classStr: "server-text" });


								reloadCurrentModActions()
							}
						});
					}
					else {
						senderSocket.emit("messageCommandReturnStr", { message: args[1] + " does not have a ban.", classStr: "server-text" });
					}
				});

			}
		},

		mcurrentbans: {
			command: "mcurrentbans",
			help: "/mcurrentbans: Show a list of currently active bans.",
			run: function (data, senderSocket) {
				var args = data.args;
				//do stuff
				var dataToReturn = [];
				var i = 0;
				i++;

				// Cutoff so we dont return perma bans (that are 1000 years long)
				cutOffDate = new Date("2999-12-17T03:24:00");
				modAction.find({
					$or: [
						{ type: "mute" },
						{ type: "ban" }
					],
					$and: [
						{ whenRelease: { $lte: cutOffDate } },
						{ whenRelease: { $gte: new Date() } }
					]
				}, function (err, foundModActions) {
					foundModActions.forEach(function (modActionFound) {
						var message = "";
						if (modActionFound.type === "ban") {
							message = modActionFound.bannedPlayer.username + " was banned for " + modActionFound.reason + " by " + modActionFound.modWhoBanned.username + ", description: '" + modActionFound.descriptionByMod + "' until: " + modActionFound.whenRelease.toString();
						}
						else if (modActionFound.type === "mute") {
							message = modActionFound.bannedPlayer.username + " was muted for " + modActionFound.reason + " by " + modActionFound.modWhoBanned.username + ", description: '" + modActionFound.descriptionByMod + "' until: " + modActionFound.whenRelease.toString();
						}

						dataToReturn[dataToReturn.length] = { message: message, classStr: "server-text" };
					});

					if (dataToReturn.length === 0) {
						senderSocket.emit("messageCommandReturnStr", { message: "No one is banned! Yay!", classStr: "server-text" });
					}
					else {
						senderSocket.emit("messageCommandReturnStr", dataToReturn);
					}
				});
			}
		},
		mcompareips: {
			command: "mcompareips",
			help: "/mcompareips: Get usernames of players with the same IP.",
			run: async function (data, senderSocket) {

				var usernames = [];
				var ips = [];

				for (var i = 0; i < allSockets.length; i++) {
					usernames.push(allSockets[i].request.user.username);

					var clientIpAddress = allSockets[i].request.headers['x-forwarded-for'] || allSockets[i].request.connection.remoteAddress;
					ips.push(clientIpAddress);
				}

				var uniq = ips
					.map((ip) => {
						return { count: 1, ip: ip };
					})
					.reduce((a, b) => {
						a[b.ip] = (a[b.ip] || 0) + b.count;
						return a;
					}, {});

				var duplicateIps = Object.keys(uniq).filter((a) => uniq[a] > 1);

				var dataToReturn = [];

				if (duplicateIps.length === 0) {
					dataToReturn[0] = { message: "There are no users with matching IPs.", classStr: "server-text", dateCreated: new Date() };
				}
				else {
					dataToReturn[0] = { message: "-------------------------", classStr: "server-text", dateCreated: new Date() };


					for (var i = 0; i < duplicateIps.length; i++) {
						//for each ip, search through the whole users to see who has the ips

						for (var j = 0; j < ips.length; j++) {
							if (ips[j] === duplicateIps[i]) {
								dataToReturn.push({ message: usernames[j], classStr: "server-text", dateCreated: new Date() });
							}
						}
						dataToReturn.push({ message: "-------------------------", classStr: "server-text", dateCreated: new Date() });
					}
				}
				senderSocket.emit("messageCommandReturnStr", dataToReturn);
				return;
			}
		},
		mdc: {
			command: "mdc",
			help: "/mdc <player name>: Disconnect a player.",
			run: async function (data, senderSocket) {
				var args = data.args;

				if (!args[1]) {
					senderSocket.emit("messageCommandReturnStr", { message: "Specify a username.", classStr: "server-text" });
					return;
				}

				var targetSock = allSockets[getIndexFromUsername(allSockets, args[1], true)];
				if (targetSock) {
					targetSock.disconnect();
					senderSocket.emit("messageCommandReturnStr", { message: "Disconnected " + args[1] + " successfully.", classStr: "server-text" });

					return;
				}
				else {
					senderSocket.emit("messageCommandReturnStr", { message: "Could not find username", classStr: "server-text" });
				}
				return;
			}
		},

		mnotify: {
			command: "mnotify",
			help: "/mnotify <player name> <text to leave for player>: Leaves a message for a player that will appear in their notifications. Note your name will be added to the end of the message to them.",
			run: async function (data, senderSocket) {
				var args = data.args;
				var str = "";
				for (var i = 2; i < args.length; i++) {
					str += args[i];
					str += " ";
				}

				str += ("(From: " + senderSocket.request.user.username + ")");

				User.findOne({ usernameLower: args[1].toLowerCase() }).exec(function (err, foundUser) {
					if (err) {
						console.log(err);
						senderSocket.emit("messageCommandReturnStr", { message: "Server error... let me know if you see this.", classStr: "server-text" });
					}
					else {
						if (foundUser) {
							var userIdTarget = foundUser._id;
							var stringToSay = str;
							var link = "#";

							createNotificationObj.createNotification(userIdTarget, stringToSay, link, senderSocket.request.user.username);
							senderSocket.emit("messageCommandReturnStr", { message: "Sent to " + foundUser.username + " successfully! Here was your message: " + str, classStr: "server-text" });
						}
						else {
							senderSocket.emit("messageCommandReturnStr", { message: "Could not find " + args[1], classStr: "server-text" });
						}
					}
				});
				return;
			}
		},

		mwhisper: {
			command: "mwhisper",
			help: "/mwhisper <player name> <text to send>: Sends a whisper to a player.",
			run: async function (data, senderSocket) {
				var args = data.args;
				var str = senderSocket.request.user.username + "->" + args[1] + " (whisper): ";
				for (var i = 2; i < args.length; i++) {
					str += args[i];
					str += " ";
				}

				// str += ("(From: " + senderSocket.request.user.username + ")");

				var dataMessage = {
					message: str,
					dateCreated: new Date(),
					classStr: "whisper"
				}

				var sendToSocket = allSockets[getIndexFromUsername(allSockets, args[1], true)];

				if (!sendToSocket) {
					senderSocket.emit("messageCommandReturnStr", { message: "Could not find " + args[1], classStr: "server-text" });
				}
				else {
					//send notification that you can do /r for first whisper message
					if (!lastWhisperObj[sendToSocket.request.user.username]) {
						sendToSocket.emit("allChatToClient", { message: "You can do /r <message> to reply.", classStr: "whisper", dateCreated: new Date() });
						sendToSocket.emit("roomChatToClient", { message: "You can do /r <message> to reply.", classStr: "whisper", dateCreated: new Date() });
					}

					sendToSocket.emit("allChatToClient", dataMessage);
					sendToSocket.emit("roomChatToClient", dataMessage);

					senderSocket.emit("allChatToClient", dataMessage);
					senderSocket.emit("roomChatToClient", dataMessage);

					//set the last whisper person
					lastWhisperObj[sendToSocket.request.user.username] = senderSocket.request.user.username;

					lastWhisperObj[senderSocket.request.user.username] = sendToSocket.request.user.username;
				}

				return;

			}
		},

		mremoveavatar: {
			command: "mremoveavatar",
			help: "/mremoveavatar <player name>: Remove <player name>'s avatar.",
			run: async function (data, senderSocket) {
				var args = data.args;

				if (!args[1]) {
					senderSocket.emit("messageCommandReturnStr", { message: "Specify a username.", classStr: "server-text" });
					return;
				}

				User.findOne({ usernameLower: args[1].toLowerCase() }).populate("notifications").exec(function (err, foundUser) {
					if (err) { console.log(err); }
					else {
						if (foundUser !== undefined) {
							foundUser.avatarImgRes = "";
							foundUser.avatarImgSpy = "";
							foundUser.save();

							senderSocket.emit("messageCommandReturnStr", { message: "Successfully removed " + args[1] + "'s avatar.", classStr: "server-text" });
						}
						else {
							senderSocket.emit("messageCommandReturnStr", { message: "Could not find " + args[1] + "'s avatar. If you think this is a problem, contact admin.", classStr: "server-text" });
						}

					}
				});
				return;
			}
		},

		maddbots: {
			command: "maddbots",
			help: "/maddbots <number>: Add <number> bots to the room.",
			run: function (data, senderSocket, roomIdInput) {
				var args = data.args;

				if (!args[1]) {
					senderSocket.emit("messageCommandReturnStr", { message: "Specify a number.", classStr: "server-text" });
					return;
				}

				var roomId;
				if (senderSocket === undefined) {
					roomId = roomIdInput;
				}
				else {
					roomId = senderSocket.request.user.inRoomId;
				}

				if (rooms[roomId]) {
					var dummySockets = [];

					for (var i = 0; i < args[1]; i++) {
						var botName = "SimpleBot" + "#" + Math.floor(Math.random() * 100);

						// Avoid a username clash!
						var currentUsernames = rooms[roomId].socketsOfPlayers.map(function (sock) { return sock.request.user.username; });
						if (currentUsernames.includes(botName)) {
							i--;
							continue;
						}

						dummySockets[i] = new SimpleBotSocket(botName);
						rooms[roomId].playerJoinRoom(dummySockets[i]);
						rooms[roomId].playerSitDown(dummySockets[i]);

						//Save a copy of the sockets within botSockets
						if (!rooms[roomId].botSockets) {
							rooms[roomId].botSockets = [];
						}
						rooms[roomId].botSockets.push(dummySockets[i]);
					};
				}
				return;
			}
		},

		mtestgame: {
			command: "mtestgame",
			help: "/mtestgame <number>: Add <number> bots to a test game and start it automatically.",
			run: function (data, senderSocket, io) {
				var args = data.args;

				if (!args[1]) {
					senderSocket.emit("messageCommandReturnStr", { message: "Specify a number.", classStr: "server-text" });
					return;
				}

				if (parseInt(args[1]) > 10 || parseInt(args[1]) < 1) {
					senderSocket.emit("messageCommandReturnStr", { message: "Specify a number between 1 and 10.", classStr: "server-text" });
					return;
				}

				//Get the next room Id
				while (rooms[nextRoomId]) {
					nextRoomId++;
				}
				dataObj = {
					maxNumPlayers: 10,
					newRoomPassword: "",
					gameMode: "avalonBot"
				}



				//Create the room
				rooms[nextRoomId] = new gameRoom("Bot game", nextRoomId, io, dataObj.maxNumPlayers, dataObj.newRoomPassword, dataObj.gameMode);
				var privateStr = ("" === dataObj.newRoomPassword) ? "" : "private ";
				//broadcast to all chat
				var messageData = {
					message: "Bot game" + " has created " + privateStr + "room " + nextRoomId + ".",
					classStr: "server-text"
				}
				sendToAllChat(io, messageData);

				//Add the bots to the room
				actionsObj.modCommands.maddbots.run(data, undefined, nextRoomId);

				//Start the game.
				var options = ["Merlin", "Assassin", "Percival", "Morgana", "Ref of the Rain", "Sire of the Sea", "Lady of the Lake"];
				rooms[nextRoomId].hostTryStartGame(options, "avalonBot");

				updateCurrentGamesList();

				return;
			}
		},

		mremovefrozen: {
			command: "mremovefrozen",
			help: "/mremovefrozen: Remove all frozen rooms and the corresponding save files in the database.",
			run: function (data, senderSocket) {

				for (var i = 0; i < rooms.length; i++) {
					if (rooms[i] && rooms[i].frozen === true) {
						destroyRoom(rooms[i].roomId);
					}
				}
				updateCurrentGamesList();
				return;
			}
		},

		mclose: {
			command: "mclose",
			help: "/mclose <roomId> [<roomId> <roomId> ...]: Close room <roomId>. Also removes the corresponding save files in the database. Can take multiple room IDs.",
			run: function (data, senderSocket) {
				var args = data.args;

				if (!args[1]) {
					senderSocket.emit("messageCommandReturnStr", { message: "Specify a number.", classStr: "server-text" });
					return;
				}

				var roomIdsToClose = args.splice(1)
				// console.log(roomIdsToClose);

				roomIdsToClose.forEach((idToClose) => {
					if (rooms[idToClose] !== undefined) {
						// Disconnect everyone
						for (var i = 0; i < rooms[idToClose].allSockets.length; i++) {
							rooms[idToClose].allSockets[i].emit("leave-room-requested");
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
						senderSocket.emit("messageCommandReturnStr", { message: `Closed room ${idToClose}.`, classStr: "server-text" });
					}
					else {
						senderSocket.emit("messageCommandReturnStr", { message: `Could not close room ${idToClose}.`, classStr: "server-text" });
					}
				});

				updateCurrentGamesList();
				return;
			}
		},
		mannounce: {
			command: "mannounce",
			help: "/mannounce <message>: Sends a sweet alert to all online players with an included message. It automatically says the username of the mod that executed the command.",
			run: function (data, senderSocket) {
				var args = data.args;
				if (!args[1]) {
					senderSocket.emit("messageCommandReturnStr", { message: "Please enter a message...", classStr: "server-text" });
					return;
				}

				var str = "";
				for (var i = 1; i < args.length; i++) {
					str += args[i];
					str += " ";
				}

				str += "<br><br>From: " + senderSocket.request.user.username;

				allSockets.forEach(function (sock) {
					sock.emit("mannounce", str);
				});
			}
		},

		mforcemove: {
			command: "mforcemove",
			help: "/mforcemove <username> [button] [target]: Forces a player to make a move. To see what moves are available, enter the target's username. To force the move, input button and/or target.",
			run: function (data, senderSocket) {
				var args = data.args;

				senderSocket.emit("messageCommandReturnStr", { message: `You have entered: ${args.join(" ")}`, classStr: "server-text" });

				var username = args[1];
				var button = args[2];
				var targets = args.splice(3);

				var thisRoom = rooms[senderSocket.request.user.inRoomId]

				if (thisRoom === undefined) {
					senderSocket.emit("messageCommandReturnStr", { message: `Please enter a room to use this command.`, classStr: "server-text" });
					return;
				}

				if (thisRoom.gameStarted === false) {
					senderSocket.emit("messageCommandReturnStr", { message: `The game has not started.`, classStr: "server-text" });
					return;
				}

				if (args.length <= 1) {
					senderSocket.emit("messageCommandReturnStr", { message: `Please enter valid arguments.`, classStr: "server-text" });
					return;
				}

				var playerIndex = getIndexFromUsername(thisRoom.playersInGame, username, true);

				if (playerIndex === undefined) {
					senderSocket.emit("messageCommandReturnStr", { message: `Could not find player ${username}.`, classStr: "server-text" });
					return;
				}

				// Update username to be the correct case.
				username = thisRoom.playersInGame[playerIndex].request.user.username

				// If we have a username only:
				if (args.length === 2 || button === "") {
					var buttons = thisRoom.getClientButtonSettings(playerIndex);
					var numOfTargets = thisRoom.getClientNumOfTargets(playerIndex);
					var prohibitedIndexesToPick = thisRoom.getProhibitedIndexesToPick(playerIndex) || [];

					var availableButtons = []
					if (buttons.green.hidden !== true) {
						availableButtons.push("yes");
					}
					var onMissionAndResistance = (thisRoom.phase == 'votingMission' && thisRoom.playersInGame[playerIndex].alliance === "Resistance");
					// Add a special case so resistance can't fail missions.
					if (buttons.red.hidden !== true && onMissionAndResistance === false) {
						availableButtons.push("no");
					}

					var availablePlayers = thisRoom.playersInGame
						.filter(function (player, playerIndex) {
							return prohibitedIndexesToPick.indexOf(playerIndex) === -1;
						}).map(function (player) {
							return player.request.user.username;
						});

					// If there are 0 number of targets, there are no available players.
					if (numOfTargets === null) {
						var availablePlayers = null; // null here so that the user can see this. For other operations, set to [].
					}

					if (availableButtons.length !== 0) {
						senderSocket.emit("messageCommandReturnStr", { message: `---------------`, classStr: "server-text" });
						senderSocket.emit("messageCommandReturnStr", { message: `Player ${username} can make the following moves:`, classStr: "server-text" });
						senderSocket.emit("messageCommandReturnStr", { message: `Buttons: ${availableButtons}.`, classStr: "server-text" });
						senderSocket.emit("messageCommandReturnStr", { message: `Targets: ${availablePlayers}.`, classStr: "server-text" });
						senderSocket.emit("messageCommandReturnStr", { message: `Number of targets: ${numOfTargets}.`, classStr: "server-text" });
						senderSocket.emit("messageCommandReturnStr", { message: `---------------`, classStr: "server-text" });
					}
					else {
						senderSocket.emit("messageCommandReturnStr", { message: `Player ${username} cannot make any moves.`, classStr: "server-text" });
					}
				}



				// User is trying to force move.
				else {
					// Raise the caps for target usernames
					targetsCaps = [];
					for (var i = 0; i < targets.length; i++) {
						var playerIndexFound = getIndexFromUsername(thisRoom.playersInGame, targets[i], true);
						var playerSimulatedSocket = thisRoom.playersInGame[playerIndexFound];
						if (playerSimulatedSocket === undefined) {
							senderSocket.emit("messageCommandReturnStr", { message: `Could not find player ${targets[i]}.`, classStr: "server-text" });
							return;
						}
						targetsCaps.push(thisRoom.playersInGame[playerIndexFound].request.user.username)
					}

					thisRoom.sendText(thisRoom.allSockets, `Moderator ${senderSocket.request.user.username} has forced a move: `, "server-text");
					thisRoom.sendText(thisRoom.allSockets, `Player: ${username} | Button: ${button} | Targets: ${targetsCaps}.`, "server-text");

					var targetSimulatedSocket = thisRoom.playersInGame[playerIndex];
					if (targetSimulatedSocket.emit === undefined) {
						targetSimulatedSocket.emit = function () { };
					}
					thisRoom.gameMove(targetSimulatedSocket, [button, targetsCaps]);

					return;
				}
			}
		}
	},

	adminCommands: {
		a: {
			command: "a",
			help: "/a: ...shows mods commands",
			run: function (data) {
				var args = data.args;
				//do stuff
				var dataToReturn = [];
				var i = 0;
				i++;

				for (var key in actionsObj.adminCommands) {
					if (actionsObj.adminCommands.hasOwnProperty(key)) {
						if (!actionsObj.adminCommands[key].modsOnly) {
							dataToReturn[i] = { message: actionsObj.adminCommands[key].help, classStr: "server-text" };
							i++;
						}
					}
				}
				return dataToReturn;
			}
		},

		admintest: {
			command: "admintest",
			help: "/admintest: Testing that only the admin can access this command",
			run: function (data) {
				var args = data.args;
				//do stuff
				return { message: "admintest has been run.", classStr: "server-text" };
			}
		},

		killS: {
			command: "killS",
			help: "/killS: test kill",
			run: function (data) {
				var args = data.args;
				//do stuff
				process.exit(0);

				return { message: "killS has been run.", classStr: "server-text" };
			}
		},

		aram: {
			command: "aram",
			help: "/aram: get the ram used",
			run: function (data) {
				var args = data.args;

				const used = process.memoryUsage().heapUsed / 1024 / 1024;
				// console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

				return { message: `The script uses approximately ${Math.round(used * 100) / 100} MB`, classStr: "server-text" };
			}
		},

		aip: {
			command: "aip",
			help: "/aip <player name>: Get the ip of the player.",
			run: async function (data, senderSocket) {
				var args = data.args;

				if (!args[1]) {
					// console.log("a");
					senderSocket.emit("messageCommandReturnStr", { message: "Specify a username", classStr: "server-text" });
					return { message: "Specify a username.", classStr: "server-text" }
				}


				var slapSocket = allSockets[getIndexFromUsername(allSockets, args[1])];
				if (slapSocket) {
					// console.log("b");
					var clientIpAddress = slapSocket.request.headers['x-forwarded-for'] || slapSocket.request.connection.remoteAddress;

					senderSocket.emit("messageCommandReturnStr", { message: clientIpAddress, classStr: "server-text" });

					return { message: "slapSocket.request.user.username", classStr: "server-text" };
				}
				else {
					// console.log("c");

					senderSocket.emit("messageCommandReturnStr", { message: "No IP found or invalid username", classStr: "server-text" });

					return { message: "There is no such player.", classStr: "server-text" };
				}
			}
		},
		aipban: {
			command: "aipban",
			help: "/aipban <ip>: Ban the IP of the IP given. /munban does not undo this ban. Contact ProNub to remove an IP ban.",
			run: function (data, senderSocket) {
				var args = data.args;

				if (!args[1]) {
					senderSocket.emit("messageCommandReturnStr", { message: "Specify an IP", classStr: "server-text" });
					return { message: "Specify a username.", classStr: "server-text" };
				}

				User.find({ usernameLower: senderSocket.request.user.username.toLowerCase() }).populate("notifications").exec(function (err, foundUser) {
					if (err) { console.log(err); }
					else if (foundUser) {

						var banIpData = {
							type: "ip",
							bannedIp: args[1],
							usernamesAssociated: [],
							modWhoBanned: { id: foundUser._id, username: foundUser.username },
							whenMade: new Date(),
						}

						banIp.create(banIpData, function (err, newBan) {
							if (err) { console.log(err); }
							else {
								senderSocket.emit("messageCommandReturnStr", { message: "Successfully banned ip " + args[1], classStr: "server-text" });
							}
						});
					}
					else {
						//send error message back
						senderSocket.emit("messageCommandReturnStr", { message: "Could not find your user data (your own one, not the person you're trying to ban)", classStr: "server-text" });
					}
				});
			}
		}
	}
}


var userCommands = actionsObj.userCommands;
var modCommands = actionsObj.modCommands;
var adminCommands = actionsObj.adminCommands;


function reloadCurrentModActions() {
	//load up all the modActions that are not released yet
	modAction.find({ whenRelease: { $gt: new Date() }, $or: [{ type: "mute" }, { type: "ban" }] }, function (err, allModActions) {
		//reset currentModActions
		currentModActions = [];
		for (var i = 0; i < allModActions.length; i++) {
			currentModActions.push(allModActions[i]);
		}
		// console.log("mute");
		// console.log(currentModActions);
	});
}


ioGlobal = {};

module.exports = function (io) {
	//SOCKETS for each connection
	ioGlobal = io;
	io.sockets.on("connection", async function (socket) {

		if (socket.request.isAuthenticated()) {
			// console.log("User is authenticated");
		} else {
			// console.log("User is not authenticated");
			socket.emit("alert", "You are not authenticated.");
			return;
		}

		//remove any duplicate sockets
		for (var i = 0; i < allSockets.length; i++) {
			if (allSockets[i].request.user.id === socket.request.user.id) {
				allSockets[i].disconnect(true);
			}
		}

		// Grab their rewards
		socket.rewards = await getRewardsObj.getAllRewardsForUser(socket.request.user);
		console.log("Socket rewards: ");
		console.log(socket.rewards);

		socket = applyApplicableRewards(socket);

		//now push their socket in
		allSockets.push(socket);


		//slight delay while client loads
		setTimeout(function () {
			//check if they have a ban or a mute
			for (var i = 0; i < currentModActions.length; i++) {
				if (currentModActions[i].bannedPlayer.id && socket.request.user.id.toString() === currentModActions[i].bannedPlayer.id.toString()) {
					if (currentModActions[i].type === "mute") {
						socket.emit("muteNotification", currentModActions[i]);
					}
					else if (currentModActions[i].type === "ban") {
						socket.emit("redirect", "/")
						socket.disconnect();
					}
				}
			}

			console.log(socket.request.user.username + " has connected under socket ID: " + socket.id);

			//send the user its ID to store on their side.
			socket.emit("username", socket.request.user.username);
			//send the user the list of commands
			socket.emit("commands", userCommands);

			//if the mods name is inside the array
			if (modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
				//send the user the list of commands
				socket.emit("modCommands", modCommands);

				// mcompareips
				setTimeout(function () { actionsObj.modCommands.mcompareips.run(null, socket); }, 3000);

				avatarRequest.find({ processed: false }).exec(function (err, allAvatarRequests) {
					if (err) { console.log(err); }
					else {
						socket.emit("", modCommands);

						setTimeout(function () {
							if (allAvatarRequests.length !== 0) {
								if (allAvatarRequests.length === 1) {
									socket.emit("allChatToClient", { message: "There is " + allAvatarRequests.length + " pending custom avatar request.", classStr: "server-text" });
									socket.emit("roomChatToClient", { message: "There is " + allAvatarRequests.length + " pending custom avatar request.", classStr: "server-text" });
								}
								else {
									socket.emit("allChatToClient", { message: "There are " + allAvatarRequests.length + " pending custom avatar requests.", classStr: "server-text" });
									socket.emit("roomChatToClient", { message: "There are " + allAvatarRequests.length + " pending custom avatar requests.", classStr: "server-text" });
								}
							}
							else {
								socket.emit("allChatToClient", { message: "There are no pending custom avatar requests!", classStr: "server-text" });
								socket.emit("roomChatToClient", { message: "There are no pending custom avatar requests!", classStr: "server-text" });
							}
						}, 3000);

					}
				});
			}

			//if the admin name is inside the array
			if (adminsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
				//send the user the list of commands
				socket.emit("adminCommands", adminCommands);
			}

			socket.emit("checkSettingsResetDate", dateResetRequired);
			socket.emit("checkNewUpdate", { date: newUpdateNotificationRequired, msg: updateMessage });
			socket.emit("checkNewPlayerShowIntro", "");
			//Pass in the gameModes for the new room menu.
			socket.emit("gameModes", gameModeNames);

			User.findOne({ username: socket.request.user.username }).exec(function (err, foundUser) {
				if (foundUser.mutedPlayers) {
					socket.emit("updateMutedPlayers", foundUser.mutedPlayers);
				}
			});


			//automatically join the all chat
			socket.join("allChat");
			//socket sends to all players
			var data = {
				message: socket.request.user.username + " has joined the lobby.",
				classStr: "server-text-teal"
			}
			sendToAllChat(io, data);

			updateCurrentPlayersList(io);
			// console.log("update current players list");
			// console.log(getPlayerUsernamesFromAllSockets());
			updateCurrentGamesList(io);
			// message mods if player's ip matches another player
			matchedIpsUsernames = [];
			var joiningIpAddress = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
			var joiningUsername = socket.request.user.username;
			for (var i = 0; i < allSockets.length; i++) {
				var clientIpAddress = allSockets[i].request.headers['x-forwarded-for'] || allSockets[i].request.connection.remoteAddress;
				var clientUsername = allSockets[i].request.user.username;
				// console.log(clientUsername);
				// console.log(clientIpAddress);
				if (clientIpAddress === joiningIpAddress && clientUsername !== joiningUsername)
					matchedIpsUsernames.push(clientUsername);
			}
			if (matchedIpsUsernames.length > 0) {
				sendToAllMods(io, { message: "MOD WARNING! '" + socket.request.user.username + "' has just logged in with the same IP as: ", classStr: "server-text" });
				sendToAllMods(io, { message: "-------------------------", classStr: "server-text" });
				for (var i = 0; i < matchedIpsUsernames.length; i++) {
					sendToAllMods(io, { message: matchedIpsUsernames[i], classStr: "server-text" });
				}
				sendToAllMods(io, { message: "-------------------------", classStr: "server-text" });
			}
		}, 1000);


		//when a user disconnects/leaves the whole website
		socket.on("disconnect", disconnect);

		socket.on("modAction", async function (data) {

			if (modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
				// var parsedData = JSON.parse(data);
				var newModAction = {};
				var userNotFound = false;

				await data.forEach(async function (item) {
					if (item.name === "banPlayerUsername") {
						//not case sensitive
						await User.findOne({ usernameLower: item.value.toLowerCase() }, function (err, foundUser) {
							if (err) { console.log(err); }
							else {
								// foundUser = foundUser[0];
								if (!foundUser) {
									socket.emit("messageCommandReturnStr", { message: "User not found. Please check spelling and caps.", classStr: "server-text" });
									userNotFound = true;
									return;
								}
								// console.log(foundUser);
								newModAction.bannedPlayer = {};
								newModAction.bannedPlayer.id = foundUser._id;
								newModAction.bannedPlayer.username = foundUser.username;
								newModAction.bannedPlayer.usernameLower = foundUser.usernameLower;

								socket.emit("messageCommandReturnStr", { message: "User found, Adding in details...\t", classStr: "server-text" });

							}
						});
					}
					else if (item.name === "typeofmodaction") {
						newModAction.type = item.value;
					}
					else if (item.name === "reasonofmodaction") {
						newModAction.reason = item.value;
					}
					else if (item.name === "durationofmodaction") {
						var oneSec = 1000;
						var oneMin = oneSec * 60;
						var oneHr = oneMin * 60;
						var oneDay = oneHr * 24;
						var oneMonth = oneDay * 30;
						var oneYear = oneMonth * 12;
						//30 min, 3hr, 1 day, 3 day, 7 day, 1 month
						var durations = [
							oneMin * 30,
							oneHr * 3,
							oneDay,
							oneDay * 3,
							oneDay * 7,
							oneMonth,
							oneMonth * 6,
							oneYear,
							oneYear * 1000
						];
						newModAction.durationToBan = new Date(durations[item.value]);
					}
					else if (item.name === "descriptionByMod") {
						newModAction.descriptionByMod = item.value;
					}
				});

				if (userNotFound === true) {
					return;
				}

				await User.findById(socket.request.user.id, function (err, foundUser) {
					if (err) { console.log(err); }
					else {
						newModAction.modWhoBanned = {};
						newModAction.modWhoBanned.id = foundUser._id;
						newModAction.modWhoBanned.username = foundUser.username;
					}
				});

				newModAction.whenMade = new Date();
				newModAction.whenRelease = newModAction.whenMade.getTime() + newModAction.durationToBan.getTime();

				setTimeout(function () {
					// console.log(newModAction);
					if (userNotFound === false && newModAction.bannedPlayer && newModAction.bannedPlayer.username) {
						modAction.create(newModAction, function (err, newModActionCreated) {
							if (newModActionCreated !== undefined) {
								// console.log(newModActionCreated);
								//push new mod action into the array of currently active ones loaded.
								currentModActions.push(newModActionCreated);
								//if theyre online
								if (newModActionCreated.type === "ban" && allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)]) {
									allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)].disconnect(true);
								}
								else if (newModActionCreated.type === "mute" && allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)]) {
									allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)].emit("muteNotification", newModActionCreated);
								}

								socket.emit("messageCommandReturnStr", { message: newModActionCreated.bannedPlayer.username + " has received a " + newModActionCreated.type + " modAction. Thank you :).", classStr: "server-text" });
							}
							else {
								socket.emit("messageCommandReturnStr", { message: "Something went wrong...", classStr: "server-text" });
							}
						});
					}
					else {
						var str = "Something went wrong... Contact the admin! Details: ";
						str += "UserNotFound: " + userNotFound;
						str += "\t newModAction.bannedPlayer: " + newModAction.bannedPlayer;
						str += "\t newModAction.username: " + newModAction.username;
						socket.emit("messageCommandReturnStr", { message: str, classStr: "server-text" });
					}
				}, 3000);
			}
			else {
				//create a report. someone doing something bad.
			}
		});

		//=======================================
		//COMMANDS
		//=======================================

		socket.on("messageCommand", messageCommand);
		socket.on("interactUserPlayed", interactUserPlayed);
		//when a user tries to send a message to all chat
		socket.on("allChatFromClient", allChatFromClient);
		//when a user tries to send a message to room
		socket.on("roomChatFromClient", roomChatFromClient);
		//when a new room is created
		socket.on("newRoom", newRoom);
		//when a player joins a room
		socket.on("join-room", joinRoom);
		socket.on("join-game", joinGame);
		socket.on("standUpFromGame", standUpFromGame);

		//when a player leaves a room
		socket.on("leave-room", leaveRoom);
		socket.on("player-ready", playerReady);
		socket.on("player-not-ready", playerNotReady);
		socket.on("startGame", startGame);
		socket.on("kickPlayer", kickPlayer);
		socket.on("update-room-max-players", updateRoomMaxPlayers);
		socket.on("update-room-game-mode", updateRoomGameMode);

		//************************
		//game data stuff
		//************************
		socket.on("gameMove", gameMove);
		socket.on("setClaim", setClaim);
	});
}

var applyApplicableRewards = function (socket) {

	// Admin badge
	if (socket.rewards.includes(REWARDS.ADMIN_BADGE)) {
		socket.request.displayUsername = socket.request.user.username + " [A]";
		// socket.request.displayUsername = "[A] " + socket.request.user.username;
	}
	// Moderator badge
	else if (socket.rewards.includes(REWARDS.MOD_BADGE)) {
		socket.request.displayUsername = socket.request.user.username + " [M]";
		// socket.request.displayUsername = "[M] " + socket.request.user.username;
	}


	// Tier4 badge
	if (socket.rewards.includes(REWARDS.TIER4_BADGE)) {
		socket.request.displayUsername = socket.request.user.username + " [T4]";
	}
	// Tier3 badge
	else if (socket.rewards.includes(REWARDS.TIER3_BADGE)) {
		socket.request.displayUsername = socket.request.user.username + " [T3]";
	}
	// Tier2 badge
	else if (socket.rewards.includes(REWARDS.TIER2_BADGE)) {
		socket.request.displayUsername = socket.request.user.username + " [T2]";
	}
	// Tier1 badge
	else if (socket.rewards.includes(REWARDS.TIER1_BADGE)) {
		socket.request.displayUsername = socket.request.user.username + " [T1]";
	}


	return socket;
}

var updateCurrentPlayersList = function () {
	ioGlobal.in("allChat").emit("update-current-players-list", getPlayerDisplayUsernamesFromAllSockets());
}

var updateCurrentGamesList = function () {
	//prepare room data to send to players.
	var gamesList = [];
	for (var i = 0; i < rooms.length; i++) {
		//If the game exists
		if (rooms[i]) {
			//create new array to send
			gamesList[i] = {};
			//get status of game
			gamesList[i].status = rooms[i].getStatus();

			if (rooms[i].joinPassword !== undefined) {
				gamesList[i].passwordLocked = true;
			}
			else {
				gamesList[i].passwordLocked = false;
			}
			//get room ID
			gamesList[i].roomId = rooms[i].roomId;
			gamesList[i].gameMode = rooms[i].gameMode.charAt(0).toUpperCase() + rooms[i].gameMode.slice(1);
			// console.log("Room " + rooms[i].roomId + " has host: " + rooms[i].host);
			gamesList[i].hostUsername = rooms[i].host;
			if (rooms[i].gameStarted === true) {
				gamesList[i].numOfPlayersInside = rooms[i].playersInGame.length;
				gamesList[i].missionHistory = rooms[i].missionHistory;
				gamesList[i].missionNum = rooms[i].missionNum;
				gamesList[i].pickNum = rooms[i].pickNum;
			}
			else {
				gamesList[i].numOfPlayersInside = rooms[i].socketsOfPlayers.length;
			}
			gamesList[i].maxNumPlayers = rooms[i].maxNumPlayers;
			gamesList[i].numOfSpectatorsInside = rooms[i].allSockets.length - rooms[i].socketsOfPlayers.length;
		}
	}
	allSockets.forEach(function (sock) {
		sock.emit("update-current-games-list", gamesList);
	});
}


function textLengthFilter(str) {
	var lengthLimit = 500;

	if (str.length > lengthLimit) {
		return str.slice(0, lengthLimit);
	}
	else {
		return str;
	}
}

var fiveMinsInMillis = 1000 * 60 * 5;

function sendToAllChat(io, data) {
	var date = new Date();
	data.dateCreated = date;


	allSockets.forEach(function (sock) {
		sock.emit("allChatToClient", data);
	});

	allChatHistory.push(data);

	allChat5Min.push(data);

	var i = 0;

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
	io.in(roomId).emit("roomChatToClient", data);
	if (rooms[roomId]) {
		rooms[roomId].addToChatHistory(data);
	}
}

function sendToAllMods(io, data) {
	var date = new Date();
	data.dateCreated = date;

	allSockets.forEach(function (sock) {
		if (modsArray.indexOf(sock.request.user.username.toLowerCase()) !== -1) {
			sock.emit("allChatToClient", data);
			sock.emit("roomChatToClient", data);
		}
	});

}

function isMuted(socket) {
	returnVar = false;
	currentModActions.forEach(function (oneModAction) {
		if (oneModAction.type === "mute" && oneModAction.bannedPlayer && oneModAction.bannedPlayer.id && oneModAction.bannedPlayer.id.toString() === socket.request.user.id.toString()) {
			socket.emit("muteNotification", oneModAction);
			returnVar = true;
			return;
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
	var thisGame = rooms[roomId];
	rooms[roomId].socketsOfPlayers.filter(function (socket) { return socket.isBotSocket; }).forEach(function (botSocket) {
		botSocket.handleGameOver(thisGame, "complete", function () { }); // This room is getting destroyed. No need to leave.
	});

	rooms[roomId] = undefined;
}


function playerLeaveRoomCheckDestroy(socket) {
	if (socket.request.user.inRoomId && rooms[socket.request.user.inRoomId]) {
		//leave the room
		rooms[socket.request.user.inRoomId].playerLeaveRoom(socket);

		var toDestroy = rooms[socket.request.user.inRoomId].destroyRoom;

		if (toDestroy) {
			destroyRoom(socket.request.user.inRoomId);
		}

		//if room is frozen for more than 1hr then remove.
		if (rooms[socket.request.user.inRoomId]
			&& rooms[socket.request.user.inRoomId].timeFrozenLoaded
			&& rooms[socket.request.user.inRoomId].getStatus() === "Frozen"
			&& rooms[socket.request.user.inRoomId].allSockets.length === 0) {

			var curr = new Date();
			var timeToKill = 1000 * 60 * 5; //5 mins
			// var timeToKill = 1000*10; //10s
			if ((curr.getTime() - rooms[socket.request.user.inRoomId].timeFrozenLoaded.getTime()) > timeToKill) {
				destroyRoom(socket.request.user.inRoomId);

				console.log("Been more than " + timeToKill / 1000 + " seconds, removing this frozen game.");
			}
			else {
				console.log("Frozen game has only loaded for " + (curr.getTime() - rooms[socket.request.user.inRoomId].timeFrozenLoaded.getTime()) / 1000 + " seconds, Dont remove yet.");
			}
		}

		socket.request.user.inRoomId = undefined;

		updateCurrentGamesList();
	}
}


function getPlayerDisplayUsernamesFromAllSockets() {
	var array = [];
	for (var i = 0; i < allSockets.length; i++) {
		array[i] = allSockets[i].request.displayUsername ? allSockets[i].request.displayUsername : allSockets[i].request.user.username;
	}
	array.sort(function (a, b) {
		var textA = a.toUpperCase();
		var textB = b.toUpperCase();
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});
	return array;
}

function getPlayerUsernamesFromAllSockets() {
	var array = [];
	for (var i = 0; i < allSockets.length; i++) {
		array[i] = allSockets[i].request.user.username;
	}
	array.sort(function (a, b) {
		var textA = a.toUpperCase();
		var textB = b.toUpperCase();
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});
	return array;
}

function getPlayerIdsFromAllSockets() {
	var array = [];
	for (var i = 0; i < allSockets.length; i++) {
		array[i] = allSockets[i].request.user.id;
	}
	return array;
}

function getIndexFromUsername(sockets, username, caseInsensitive) {
	if (sockets && username) {
		for (var i = 0; i < sockets.length; i++) {
			if (caseInsensitive) {
				if (sockets[i].request.user.username.toLowerCase() === username.toLowerCase()) {
					return i;
				}
			}
			else {
				if (sockets[i].request.user.username === username) {
					return i;
				}
			}
		}
	}
	return undefined;
}

function disconnect(data) {
	//debugging
	console.log(this.request.user.username + " has left the lobby.");
	//remove them from all sockets
	allSockets.splice(allSockets.indexOf(this), 1);

	//send out the new updated current player list
	updateCurrentPlayersList();
	//tell all clients that the user has left
	var data = {
		message: this.request.user.username + " has left the lobby.",
		classStr: "server-text-teal"
	}
	sendToAllChat(ioGlobal, data);

	//Note, by default when this disconnects, it leaves from all rooms.
	//If user disconnected from within a room, the leave room function will send a message to other players in room.

	var username = this.request.user.username;
	var inRoomId = this.request.user.inRoomId;

	playerLeaveRoomCheckDestroy(this);

	//if they are in a room, say they're leaving the room.
	var data = {
		message: username + " has left the room.",
		classStr: "server-text-teal",
		dateCreated: new Date()
	}
	sendToRoomChat(ioGlobal, inRoomId, data);
}

function messageCommand(data) {
	// console.log("data0: " + data.command);
	// console.log("mod command exists: " + modCommands[data.command]);
	// console.log("Index of mods" + modsArray.indexOf(socket.request.user.username.toLowerCase()));
	if (userCommands[data.command]) {
		var dataToSend = userCommands[data.command].run(data, this, ioGlobal);
		this.emit("messageCommandReturnStr", dataToSend);
	}
	else if (modCommands[data.command] && modsArray.indexOf(this.request.user.username.toLowerCase()) !== -1) {
		var dataToSend = modCommands[data.command].run(data, this, ioGlobal);
		this.emit("messageCommandReturnStr", dataToSend);
	}
	else if (adminCommands[data.command] && adminsArray.indexOf(this.request.user.username.toLowerCase()) !== -1) {
		var dataToSend = adminCommands[data.command].run(data, this, ioGlobal);
		this.emit("messageCommandReturnStr", dataToSend);
	}
	else {
		var dataToSend = {
			message: "Invalid command.",
			classStr: "server-text",
			dateCreated: new Date()
		}

		this.emit("messageCommandReturnStr", dataToSend);
	}
}

function interactUserPlayed(data) {
	// socket.emit("interactUserPlayed", {success: false, interactedBy: data.username, myUsername: ownUsername, verb: data.verb, verbPast: data.verbPast});
	var socketWhoInitiatedInteract = allSockets[getIndexFromUsername(allSockets, data.interactedBy, true)];

	if (socketWhoInitiatedInteract) {
		var messageStr;
		if (data.success === true) {
			messageStr = data.myUsername + " was " + data.verbPast + "!";
		}
		else {
			messageStr = data.myUsername + " was not " + data.verbPast + ", most likely because they have already been " + data.verbPast + " recently.";
		}
		var dataToSend = {
			message: messageStr,
			classStr: "server-text",
			dateCreated: new Date()
		}

		socketWhoInitiatedInteract.emit("messageCommandReturnStr", dataToSend);
	}
}
function allChatFromClient(data) {
	//this.emit("danger-alert", "test alert asdf");
	//debugging

	var toContinue = !isMuted(this);

	// console.log(toContinue);

	if (toContinue) {
		console.log("allchat: " + data.message + " by: " + this.request.user.username);
		//get the username and put it into the data object

		var validUsernames = getPlayerUsernamesFromAllSockets();

		//if the username is not valid, i.e. one that they actually logged in as
		if (validUsernames.indexOf(this.request.user.username) === -1) {
			return;
		}

		data.username = this.request.displayUsername ? this.request.displayUsername : this.request.user.username;
		//send out that data object to all other clients (except the one who sent the message)
		data.message = textLengthFilter(data.message);
		//no classStr since its a player message

		sendToAllChat(ioGlobal, data);
	}
}

function roomChatFromClient(data) {
	// this.emit("danger-alert", "test alert asdf");
	//debugging

	var toContinue = !isMuted(this);

	if (toContinue) {
		console.log("roomchat: " + data.message + " by: " + this.request.user.username);
		//get the username and put it into the data object

		var validUsernames = getPlayerUsernamesFromAllSockets();

		//if the username is not valid, i.e. one that they actually logged in as
		if (validUsernames.indexOf(this.request.user.username) === -1) {
			return;
		}

		data.username = this.request.displayUsername ? this.request.displayUsername : this.request.user.username;

		data.message = textLengthFilter(data.message);
		data.dateCreated = new Date();

		if (this.request.user.inRoomId) {
			//send out that data object to all clients in room

			sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);
			// ioGlobal.in(data.roomId).emit("roomChatToClient", data);
		}
	}
}

function newRoom(dataObj) {

	var toContinue = !isMuted(this);

	if (toContinue && dataObj) {
		//while rooms exist already (in case of a previously saved and retrieved game)
		while (rooms[nextRoomId]) {
			nextRoomId++;
		}
		rooms[nextRoomId] = new gameRoom(this.request.user.username, nextRoomId, ioGlobal, dataObj.maxNumPlayers, dataObj.newRoomPassword, dataObj.gameMode);
		var privateStr = ("" === dataObj.newRoomPassword) ? "" : "private ";
		//broadcast to all chat
		var data = {
			message: this.request.user.username + " has created " + privateStr + "room " + nextRoomId + ".",
			classStr: "server-text"
		}
		sendToAllChat(ioGlobal, data);

		// console.log(data.message);

		//send to allChat including the host of the game
		// ioGlobal.in("allChat").emit("new-game-created", str);
		//send back room id to host so they can auto connect
		this.emit("auto-join-room-id", nextRoomId, dataObj.newRoomPassword);

		//increment index for next game
		nextRoomId++;

		updateCurrentGamesList();
	}
}


function joinRoom(roomId, inputPassword) {

	// console.log("inputpassword: " + inputPassword);

	//if the room exists
	if (rooms[roomId]) {
		//join the room
		if (rooms[roomId].playerJoinRoom(this, inputPassword) === true) {
			//sends to players and specs
			rooms[roomId].distributeGameData();

			//set the room id into the this obj
			this.request.user.inRoomId = roomId;

			//join the room chat
			this.join(roomId);

			//emit to say to others that someone has joined
			var data = {
				message: this.request.user.username + " has joined the room.",
				classStr: "server-text-teal",
				dateCreated: new Date()
			}
			sendToRoomChat(ioGlobal, roomId, data);

			updateCurrentGamesList();
		}
		else {
			// no need to do anything?
		}

	} else {
		// console.log("Game doesn't exist!");
	}
}


function joinGame(roomId) {
	var toContinue = !isMuted(this);

	if (toContinue) {
		if (rooms[roomId]) {

			//if the room has not started yet, throw them into the room
			// console.log("Game status is: " + rooms[roomId].getStatus());

			if (rooms[roomId].getStatus() === "Waiting") {
				var ToF = rooms[roomId].playerSitDown(this);
				console.log(this.request.user.username + " has joined room " + roomId + ": " + ToF);
			}
			else {
				// console.log("Game has started, player " + this.request.user.username + " is not allowed to join.");
			}
			updateCurrentGamesList();
		}
	}
}

function standUpFromGame() {
	var toContinue = !isMuted(this);

	var roomId = this.request.user.inRoomId;

	if (toContinue) {
		if (rooms[roomId]) {

			//if the room has not started yet, remove them from players list
			// console.log("Game status is: " + rooms[roomId].getStatus());

			if (rooms[roomId].getStatus() === "Waiting") {
				var ToF = rooms[roomId].playerStandUp(this);
				// console.log(this.request.user.username + " has stood up from room " + roomId + ": " + ToF);
			}
			else {
				// console.log("Game has started, player " + this.request.user.username + " is not allowed to stand up.");
			}
			updateCurrentGamesList();
		}
	}
}

function leaveRoom() {
	// console.log("In room id");
	// console.log(this.request.user.inRoomId);

	if (rooms[this.request.user.inRoomId]) {
		console.log(this.request.user.username + " is leaving room: " + this.request.user.inRoomId);
		//broadcast to let others know

		var data = {
			message: this.request.user.username + " has left the room.",
			classStr: "server-text-teal",
			dateCreated: new Date()
		}
		sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);

		//leave the room chat
		this.leave(this.request.user.inRoomId);

		playerLeaveRoomCheckDestroy(this);



		updateCurrentGamesList();
	}
}

function playerReady(username) {
	if (rooms[this.request.user.inRoomId]) {

		var data = {
			message: username + " is ready.",
			classStr: "server-text",
			dateCreated: new Date()
		}
		sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);


		if (rooms[this.request.user.inRoomId].playerReady(username) === true) {
			//game will auto start if the above returned true
		}
	}
}

function playerNotReady(username) {
	if (rooms[this.request.user.inRoomId]) {
		rooms[this.request.user.inRoomId].playerNotReady(username);
		var data = {
			message: username + " is not ready.",
			classStr: "server-text",
			dateCreated: new Date()
		}
		sendToRoomChat(ioGlobal, this.request.user.inRoomId, data);

		// ioGlobal.in(this.request.user.inRoomId).emit("player-not-ready", username + " is not ready.");
	}
}

function startGame(data, gameMode) {
	//start the game
	if (rooms[this.request.user.inRoomId]) {

		if (this.request.user.inRoomId && this.request.user.username === rooms[this.request.user.inRoomId].host) {
			rooms[this.request.user.inRoomId].hostTryStartGame(data, gameMode);
			//this.emit("update-room-players", rooms[roomId].getPlayers());
		} else {
			// console.log("Room doesn't exist or user is not host, cannot start game");
			this.emit("danger-alert", "You are not the host. You cannot start the game.")
			return;
		}
	}
	updateCurrentGamesList(ioGlobal);
}

function kickPlayer(username) {
	console.log("received kick player request: " + username);
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
	console.log(data);
	if (rooms[this.request.user.inRoomId]) {
		rooms[this.request.user.inRoomId].gameMove(this, data);
		if (rooms[this.request.user.inRoomId]) {
			if (rooms[this.request.user.inRoomId].finished === true) {
				deleteSaveGameFromDb(rooms[this.request.user.inRoomId]);
			}
			else {
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

