//sockets
var gameRoom = require("../gameplay/game");

var savedGameObj = require("../models/savedGame");
var modAction = require("../models/modAction");
var currentModActions = [];
var myNotification = require("../models/notification");
var createNotificationObj = require("../myFunctions/createNotification");


var avatarRequest = require("../models/avatarRequest");
var User = require("../models/user");
var banIp = require("../models/banIp");
const JSON = require('circular-json');
var modsArray = require("../modsadmins/mods");
var adminsArray = require("../modsadmins/admins");

const dateResetRequired = 1543480412695;

const newUpdateNotificationRequired = 1551095116448;
const updateMessage = `

<h1>IMPORTANT</h1>

<br>

I have recently patched a vulnerability in the code. Users with very simple, guessable passwords are at risk. Those who have been identified as suspicious have been directly contacted already.

<br>
<br>

As a result I recommend everyone change their passwords to ensure complete safety. You can do this through your profile now. Bocaben recommended me use LastPass and I enjoy it thoroughly. I encourage you to also use LastPass or a similar password manager. 

<br>
<br>

Thanks guys
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
// console.log(gameModeNames);




process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
	// if(process.env.MY_PLATFORM === "online"){
	// 	saveGamesAndSendWarning();
	// }
	// else{
	sendWarning();
	// }

	console.log("Graceful shutdown request");

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
	// if(process.env.MY_PLATFORM === "online"){
	// console.log("room id to remove");
	// console.log(roomToSave.savedGameRecordId);


	savedGameObj.findByIdAndRemove(room.savedGameRecordId, function (err) {
		if (err) {
			console.log(err);
		}
		else {
			// console.log("Successfully removed this save game from db");
		}
	});


	// }

}

function saveGamesAndSendWarning(senderSocket) {
	for (var key in allSockets) {
		if (allSockets.hasOwnProperty(key)) {
			if (senderSocket) {
				allSockets[key].emit("serverRestartWarning");
			} else {
				// allSockets[key].emit("serverDailyRestartWarning");
			}
		}
	}

	var numOfGamesSaved = 0;
	var numOfGamesEncountered = 0;
	var promises = [];

	// //save the games
	// for(var i = 0; i < rooms.length; i++){
	// 	if(rooms[i] && rooms[i].gameStarted === true && rooms[i].finished !== true){
	// 		console.log("rooms");
	// 		// console.log(rooms[i]);

	// 		savedGameObj.create({room: JSON.stringify(rooms[i])}, function(err, savedGame){
	// 			if(err){
	// 				console.log(err);
	// 			}
	// 			console.log(savedGame);
	// 			numOfGamesSaved++;

	// 			console.log("created");
	// 			console.log(numOfGamesSaved >= numOfGamesEncountered);
	// 			console.log(numOfGamesSaved);
	// 			console.log(numOfGamesEncountered);

	// 			if(numOfGamesSaved >= numOfGamesEncountered){
	// 				var data = {message: "Successful. Saved " + numOfGamesSaved + " games.", classStr: "server-text"};
	// 				if(senderSocket){
	// 					senderSocket.emit("messageCommandReturnStr", data);
	// 				}

	// 				// //if its a heroku update
	// 				// if(!senderSocket){
	// 				// 	process.exit(0);
	// 				// }
	// 			}

	// 		});
	// 		numOfGamesEncountered++;
	// 	}
	// }

	// console.log(numOfGamesEncountered);

	if (numOfGamesEncountered === 0) {
		return { message: "Successful. But no games needed to be saved.", classStr: "server-text" };
	}
	else {
		return { message: "Successful. But still saving games.", classStr: "server-text" };
	}
}


// RECOVERING SAVED GAMES!
savedGameObj.find({}).exec(function (err, foundSaveGameArray) {
	if (err) { console.log(err); }
	else {
		for (var key in foundSaveGameArray) {
			if (foundSaveGameArray.hasOwnProperty(key)) {
				// console.log(foundSaveGameArray);

				var foundSaveGame = foundSaveGameArray[key];

				if (foundSaveGame) {
					// console.log("Parsed:");
					// console.log(JSON.parse(foundSaveGame.room));

					var storedData = JSON.parse(foundSaveGame.room);

					rooms[storedData["roomId"]] = new gameRoom();

					Object.assign(rooms[storedData["roomId"]], storedData);

					// //Assigning in all the previous variables
					// for(var key in storedData){
					// 	if(storedData.hasOwnProperty(key)){
					// 		// console.log("typeof: " + typeof(key))
					// 		rooms[storedData["roomId"]][key] = storedData[key];
					// 		// console.log("copied over: " + key);
					// 		// if(key === "startGameTime"){

					// 			// console.log(storedData[key]);
					// 			// console.log(new Date - storedData[key]);
					// 		// }
					// 	}
					// }

					// rooms[storedData["roomId"]].loadRoleCardData(storedData["avalonRoles"], storedData["avalonCards"]);
					// rooms[storedData["roomId"]].reloadParentFunctions();


					rooms[storedData["roomId"]].restartSaved = true;
					rooms[storedData["roomId"]].savedGameRecordId = foundSaveGame.id;
					rooms[storedData["roomId"]].recoverGame(storedData);




					// console.log("Game loaded");

					// console.log("platform: " + process.env.MY_PLATFORM);
					// if(process.env.MY_PLATFORM === "online"){
					// foundSaveGame.remove();
					// }
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

				//starting break in the chat
				// data[i] = {message: "-------------------------", classStr: "server-text"};

				// var str = [];
				// str[i] = "-------------------------";

				i++;

				for (var key in actionsObj.userCommands) {
					if (actionsObj.userCommands.hasOwnProperty(key)) {
						if (!actionsObj.userCommands[key].modsOnly) {
							// console.log(key + " -> " + p[key]);
							dataToReturn[i] = { message: actionsObj.userCommands[key].help, classStr: "server-text", dateCreated: new Date() };
							// str[i] = userCommands[key].help;
							i++;
							//create a break in the chat
							// data[i] = {message: "-------------------------", classStr: "server-text"};
							// i++;
						}
					}
				}
				// return "Commands are: commandA, help";
				// return str;
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

		interactUser: {
			command: "interactUser",
			help: "/interactUser <slap/buzz/lick> <playername>: Interact with a player.",
			run: function (data, senderSocket) {
				var args = data.args;

				var possibleInteracts = ["buzz", "slap", "lick", "poke"];
				if (possibleInteracts.indexOf(args[1]) === -1) {
					return { message: "You can only slap, buzz, poke or lick, not " + args[1] + ".", classStr: "server-text", dateCreated: new Date() };
				}

				var slapSocket = allSockets[getIndexFromUsername(allSockets, args[2], true)];
				if (slapSocket) {

					var verbPast = "";
					if (args[1] === "buzz") { verbPast = "buzzed"; }
					else if (args[1] === "slap") { verbPast = "slapped"; }
					else if (args[1] === "lick") { verbPast = "licked"; }
					else if (args[1] === "poke") { verbPast = "poked"; }

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
			help: "/mute: Mute a player who is being annoying in chat/buzzing/slapping/licking/poking you.",
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

				modAction.find({ 'bannedPlayer.username': args[1] }, function (err, foundModAction) {
					// console.log("foundmodaction");
					// console.log(foundModAction);
					if (foundModAction.length !== 0) {
						modAction.remove({ 'bannedPlayer.username': args[1] }, function (err, foundModAction) {
							if (err) {
								console.log(err);
								senderSocket.emit("messageCommandReturnStr", { message: "Something went wrong.", classStr: "server-text" });
							}
							else {
								// console.log("Successfully unbanned " + args[1] + ".");
								senderSocket.emit("messageCommandReturnStr", { message: "Successfully unbanned " + args[1] + ".", classStr: "server-text" });


								//load up all the modActions again to update
								modAction.find({ whenRelease: { $gt: new Date() }, type: "mute" }, function (err, allModActions) {
									currentModActions = [];
									for (var i = 0; i < allModActions.length; i++) {
										currentModActions.push(allModActions[i]);
									}
									// console.log("mute");
									// console.log(currentModActions);
								});
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

				modAction.find({
					$or: [
						{ type: "mute" },
						{ type: "ban" }
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
				var args = data.args;

				var slapSocket = allSockets[getIndexFromUsername(allSockets, args[1])];

				var usernames = [];
				var ips = [];

				for (var i = 0; i < allSockets.length; i++) {
					usernames.push(allSockets[i].request.user.username);

					var clientIpAddress = allSockets[i].request.headers['x-forwarded-for'] || allSockets[i].request.connection.remoteAddress;
					ips.push(clientIpAddress);
				}

				var names = ['Mike', 'Matt', 'Nancy', 'Adam', 'Jenny', 'Nancy', 'Carl']

				var uniq = ips
					.map((ip) => {
						return { count: 1, ip: ip }
					})
					.reduce((a, b) => {
						a[b.ip] = (a[b.ip] || 0) + b.count
						return a
					}, {});

				var duplicateIps = Object.keys(uniq).filter((a) => uniq[a] > 1)

				// console.log(duplicateIps) // [ 'Nancy' ]
				// var indexesOfDuplicates = [][];

				// var str = "";
				var dataToReturn = [];
				dataToReturn[0] = { message: "-------------------------", classStr: "server-text", dateCreated: new Date() };


				for (var i = 0; i < duplicateIps.length; i++) {
					//for each ip, search through the whole users to see who has the ips

					for (var j = 0; j < ips.length; j++) {
						if (ips[j] === duplicateIps[i]) {
							dataToReturn.push({ message: usernames[j], classStr: "server-text", dateCreated: new Date() })
						}
					}

					dataToReturn.push({ message: "-------------------------", classStr: "server-text", dateCreated: new Date() })


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

							createNotificationObj.createNotification(userIdTarget, stringToSay, link);
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
						foundUser.avatarImgRes = "";
						foundUser.avatarImgSpy = "";
						foundUser.save();

						senderSocket.emit("messageCommandReturnStr", { message: "Successfully removed " + args[1] + "'s avatar.", classStr: "server-text" });
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

						dummySockets[i] = {
							request: {
								user: {
									username: "Bot" + i,
									bot: true
								}
							},
							emit: function () {

							}
						};
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

				//Get the next room Id
				while (rooms[nextRoomId]) {
					nextRoomId++;
				}
				dataObj = {
					maxNumPlayers: 10,
					newRoomPassword: "",
					gameMode: "avalon"
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
				rooms[nextRoomId].hostTryStartGame(options, "avalon");

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
						deleteSaveGameFromDb(rooms[i]);
						rooms[i] = undefined;
					}
				}
				updateCurrentGamesList();
				return;
			}
		},

		mclose: {
			command: "mclose",
			help: "/mclose <roomId>: Close room <roomId>. Also removes the corresponding save files in the database.",
			run: function (data, senderSocket) {
				var args = data.args;

				if (!args[1]) {
					senderSocket.emit("messageCommandReturnStr", { message: "Specify a number.", classStr: "server-text" });
					return;
				}

				if (rooms[args[1]] !== undefined) {
					// Disconnect everyone
					for (var i = 0; i < rooms[args[1]].allSockets.length; i++) {
						rooms[args[1]].allSockets[i].emit("leave-room-requested");
					}

					// Stop bots thread if they are playing:
					if (rooms[args[1]].interval) {
						clearInterval(rooms[args[1]].interval);
						rooms[args[1]].interval = undefined;
					}

					// Forcefully close room
					if (rooms[args[1]]) {
						deleteSaveGameFromDb(rooms[args[1]]);
						rooms[args[1]] = undefined;
					}
				}



				updateCurrentGamesList();
				return;
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
							// console.log(key + " -> " + p[key]);
							dataToReturn[i] = { message: actionsObj.adminCommands[key].help, classStr: "server-text" };
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

		admintest: {
			command: "admintest",
			help: "/admintest: Testing that only the admin can access this command",
			run: function (data) {
				var args = data.args;
				//do stuff
				return { message: "admintest has been run.", classStr: "server-text" };
			}
		},

		aServerRestartWarning: {
			command: "aServerRestartWarning",
			help: "/aServerRestartWarning: Only for the admin to use :)",
			run: function (data, senderSocket) {
				var args = data.args;
				// console.log(allSockets);
				//code
				if (adminsArray.indexOf(senderSocket.request.user.username.toLowerCase()) !== -1) {
					saveGamesAndSendWarning(senderSocket);
				}
				else {
					return { message: "You are not the admin...", classStr: "server-text" };
				}
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



				return;
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


//load up all the modActions that are not released yet
modAction.find({ whenRelease: { $gt: new Date() }, type: "mute" }, function (err, allModActions) {

	for (var i = 0; i < allModActions.length; i++) {
		currentModActions.push(allModActions[i]);
	}
	// console.log("mute");
	// console.log(currentModActions);
});



module.exports = function (io) {
	//SOCKETS for each connection
	io.sockets.on("connection", function (socket) {

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

				avatarRequest.find({ processed: false }).exec(function (err, allAvatarRequests) {
					if (err) { console.log(err); }
					else {
						socket.emit("", modCommands);

						setTimeout(function () {
							if (allAvatarRequests.length !== 0) {
								if (allAvatarRequests.length === 1) {
									socket.emit("messageCommandReturnStr", { message: "There is " + allAvatarRequests.length + " pending custom avatar request.", classStr: "server-text" });
								}
								else {
									socket.emit("messageCommandReturnStr", { message: "There are " + allAvatarRequests.length + " pending custom avatar requests.", classStr: "server-text" });
								}
							}
							else {
								socket.emit("messageCommandReturnStr", { message: "There are no pending custom avatar requests!", classStr: "server-text" });
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

			io.in("allChat").emit("update-current-players-list", getPlayerUsernamesFromAllSockets());
			// console.log("update current players list");
			// console.log(getPlayerUsernamesFromAllSockets());
			updateCurrentGamesList(io);
		}, 500);




		//when a user disconnects/leaves the whole website
		socket.on("disconnect", function (data) {
			//debugging
			console.log(socket.request.user.username + " has left the lobby.");

			var playerIds = getPlayerIdsFromAllSockets();


			//remove them from all sockets
			allSockets.splice(allSockets.indexOf(socket), 1);


			//send out the new updated current player list
			socket.in("allChat").emit("update-current-players-list", getPlayerUsernamesFromAllSockets());
			//tell all clients that the user has left
			var data = {
				message: socket.request.user.username + " has left the lobby.",
				classStr: "server-text-teal"
			}
			sendToAllChat(io, data);

			//Note, by default when socket disconnects, it leaves from all rooms.
			//If user disconnected from within a room, the leave room function will send a message to other players in room.

			var username = socket.request.user.username;
			var inRoomId = socket.request.user.inRoomId;

			playerLeaveRoomCheckDestroy(socket);

			//if they are in a room, say they're leaving the room.
			var data = {
				message: username + " has left the room.",
				classStr: "server-text-teal",
				dateCreated: new Date()
			}
			sendToRoomChat(io, inRoomId, data);
			// io.in(socket.request.user.inRoomId).emit("player-left-room", socket.request.user.username);

		});


		socket.on("modAction", async function (data) {

			if (modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
				// var parsedData = JSON.parse(data);
				var newModAction = {};
				var userNotFound = false;

				data.forEach(async function (item) {
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
					socket.emit("messageCommandReturnStr", { message: "Something went wrong... Contact the admin!", classStr: "server-text" });
				}
			}
			else {
				//create a report. someone doing something bad.
			}
		});

		//=======================================
		//COMMANDS
		//=======================================

		socket.on("messageCommand", function (data) {
			// console.log("data0: " + data.command);
			// console.log("mod command exists: " + modCommands[data.command]);
			// console.log("Index of mods" + modsArray.indexOf(socket.request.user.username.toLowerCase()));



			if (userCommands[data.command]) {
				var dataToSend = userCommands[data.command].run(data, socket, io);
				socket.emit("messageCommandReturnStr", dataToSend);
			}
			else if (modCommands[data.command] && modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
				var dataToSend = modCommands[data.command].run(data, socket, io);
				socket.emit("messageCommandReturnStr", dataToSend);
			}
			else if (adminCommands[data.command] && adminsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
				var dataToSend = adminCommands[data.command].run(data, socket, io);
				socket.emit("messageCommandReturnStr", dataToSend);
			}
			else {
				var dataToSend = {
					message: "Invalid command.",
					classStr: "server-text",
					dateCreated: new Date()
				}

				socket.emit("messageCommandReturnStr", dataToSend);
			}
		});

		socket.on("interactUserPlayed", function (data) {

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
		});

		//when a user tries to send a message to all chat
		socket.on("allChatFromClient", function (data) {
			//socket.emit("danger-alert", "test alert asdf");
			//debugging

			var toContinue = !isMuted(socket);

			// console.log(toContinue);

			if (toContinue) {
				console.log("allchat: " + data.message + " by: " + socket.request.user.username);
				//get the username and put it into the data object

				var validUsernames = getPlayerUsernamesFromAllSockets();

				//if the username is not valid, i.e. one that they actually logged in as
				if (validUsernames.indexOf(socket.request.user.username) === -1) {
					return;
				}

				data.username = socket.request.user.username;
				//send out that data object to all other clients (except the one who sent the message)
				data.message = textLengthFilter(data.message);
				//no classStr since its a player message

				sendToAllChat(io, data);
			}
		});

		//when a user tries to send a message to room
		socket.on("roomChatFromClient", function (data) {
			// socket.emit("danger-alert", "test alert asdf");
			//debugging

			var toContinue = !isMuted(socket);

			if (toContinue) {
				console.log("roomchat: " + data.message + " by: " + socket.request.user.username);
				//get the username and put it into the data object

				var validUsernames = getPlayerUsernamesFromAllSockets();

				//if the username is not valid, i.e. one that they actually logged in as
				if (validUsernames.indexOf(socket.request.user.username) === -1) {
					return;
				}

				data.username = socket.request.user.username;

				data.message = textLengthFilter(data.message);
				data.dateCreated = new Date();

				if (socket.request.user.inRoomId) {
					//send out that data object to all clients in room

					sendToRoomChat(io, socket.request.user.inRoomId, data);
					// io.in(data.roomId).emit("roomChatToClient", data);
				}
			}
		});


		//when a new room is created
		socket.on("newRoom", function (dataObj) {

			var toContinue = !isMuted(socket);

			if (toContinue && dataObj) {
				//while rooms exist already (in case of a previously saved and retrieved game)
				while (rooms[nextRoomId]) {
					nextRoomId++;
				}
				rooms[nextRoomId] = new gameRoom(socket.request.user.username, nextRoomId, io, dataObj.maxNumPlayers, dataObj.newRoomPassword, dataObj.gameMode);
				var privateStr = ("" === dataObj.newRoomPassword) ? "" : "private ";
				//broadcast to all chat
				var data = {
					message: socket.request.user.username + " has created " + privateStr + "room " + nextRoomId + ".",
					classStr: "server-text"
				}
				sendToAllChat(io, data);

				// console.log(data.message);

				//send to allChat including the host of the game
				// io.in("allChat").emit("new-game-created", str);
				//send back room id to host so they can auto connect
				socket.emit("auto-join-room-id", nextRoomId, dataObj.newRoomPassword);

				//increment index for next game
				nextRoomId++;

				updateCurrentGamesList();
			}
		});

		//when a player joins a room
		socket.on("join-room", function (roomId, inputPassword) {

			// console.log("inputpassword: " + inputPassword);

			//if the room exists
			if (rooms[roomId]) {
				//join the room
				if (rooms[roomId].playerJoinRoom(socket, inputPassword) === true) {
					//sends to players and specs
					rooms[roomId].distributeGameData();

					//set the room id into the socket obj
					socket.request.user.inRoomId = roomId;

					//join the room chat
					socket.join(roomId);

					//emit to say to others that someone has joined
					var data = {
						message: socket.request.user.username + " has joined the room.",
						classStr: "server-text-teal",
						dateCreated: new Date()
					}
					sendToRoomChat(io, roomId, data);

					updateCurrentGamesList();
				}
				else {
					// no need to do anything?
				}

			} else {
				// console.log("Game doesn't exist!");
			}
		});

		socket.on("join-game", function (roomId) {
			var toContinue = !isMuted(socket);

			if (toContinue) {
				if (rooms[roomId]) {

					//if the room has not started yet, throw them into the room
					// console.log("Game status is: " + rooms[roomId].getStatus());

					if (rooms[roomId].getStatus() === "Waiting") {
						var ToF = rooms[roomId].playerSitDown(socket);
						console.log(socket.request.user.username + " has joined room " + roomId + ": " + ToF);
					}
					else {
						// console.log("Game has started, player " + socket.request.user.username + " is not allowed to join.");
					}
					updateCurrentGamesList();
				}
			}
		});

		socket.on("standUpFromGame", function () {
			var toContinue = !isMuted(socket);

			var roomId = socket.request.user.inRoomId;

			if (toContinue) {
				if (rooms[roomId]) {

					//if the room has not started yet, remove them from players list
					// console.log("Game status is: " + rooms[roomId].getStatus());

					if (rooms[roomId].getStatus() === "Waiting") {
						var ToF = rooms[roomId].playerStandUp(socket);
						// console.log(socket.request.user.username + " has stood up from room " + roomId + ": " + ToF);
					}
					else {
						// console.log("Game has started, player " + socket.request.user.username + " is not allowed to stand up.");
					}
					updateCurrentGamesList();
				}
			}
		});


		//when a player leaves a room
		socket.on("leave-room", function () {
			// console.log("In room id");
			// console.log(socket.request.user.inRoomId);

			if (rooms[socket.request.user.inRoomId]) {
				console.log(socket.request.user.username + " is leaving room: " + socket.request.user.inRoomId);
				//broadcast to let others know

				var data = {
					message: socket.request.user.username + " has left the room.",
					classStr: "server-text-teal",
					dateCreated: new Date()
				}
				sendToRoomChat(io, socket.request.user.inRoomId, data);

				//leave the room chat
				socket.leave(socket.request.user.inRoomId);

				playerLeaveRoomCheckDestroy(socket);



				updateCurrentGamesList();
			}
		});

		socket.on("player-ready", function (username) {
			if (rooms[socket.request.user.inRoomId]) {

				var data = {
					message: username + " is ready.",
					classStr: "server-text",
					dateCreated: new Date()
				}
				sendToRoomChat(io, socket.request.user.inRoomId, data);


				if (rooms[socket.request.user.inRoomId].playerReady(username) === true) {
					//game will auto start if the above returned true
				}
			}
		});

		socket.on("player-not-ready", function (username) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].playerNotReady(username);
				var data = {
					message: username + " is not ready.",
					classStr: "server-text",
					dateCreated: new Date()
				}
				sendToRoomChat(io, socket.request.user.inRoomId, data);

				// io.in(socket.request.user.inRoomId).emit("player-not-ready", username + " is not ready.");
			}
		});

		socket.on("startGame", function (data, gameMode) {
			//start the game
			if (rooms[socket.request.user.inRoomId]) {

				if (socket.request.user.inRoomId && socket.request.user.username === rooms[socket.request.user.inRoomId].host) {
					rooms[socket.request.user.inRoomId].hostTryStartGame(data, gameMode);
					//socket.emit("update-room-players", rooms[roomId].getPlayers());
				} else {
					// console.log("Room doesn't exist or user is not host, cannot start game");
					socket.emit("danger-alert", "You are not the host. You cannot start the game.")
					return;
				}
			}
			updateCurrentGamesList(io);
		});

		socket.on("kickPlayer", function (username) {
			console.log("received kick player request: " + username);
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].kickPlayer(username, socket);

			}
		});

		socket.on("update-room-max-players", function (number) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].updateMaxNumPlayers(socket, number);
			}
			updateCurrentGamesList();
		});

		socket.on("update-room-game-mode", function (gameMode) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].updateGameModesInRoom(socket, gameMode);
			}
			updateCurrentGamesList();
		});




		//************************
		//game data stuff
		//************************
		socket.on("gameMove", function (data) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].gameMove(socket, data);

				if (rooms[socket.request.user.inRoomId]) {
					if (rooms[socket.request.user.inRoomId].finished === true) {
						deleteSaveGameFromDb(rooms[socket.request.user.inRoomId]);
					}
					else {
						saveGameToDb(rooms[socket.request.user.inRoomId]);
					}
				}

				updateCurrentGamesList(io);

			}
		});

		socket.on("setClaim", function (data) {
			if (rooms[socket.request.user.inRoomId]) {
				rooms[socket.request.user.inRoomId].setClaim(socket, data);
			}
		});



	});
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
	// io.in("allChat").emit("allChatToClient", data);



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
		//console.log("Messages older than 5 mins detected. Deleting old ones. index: " + i);
		//starting from index 0, remove i items.
		allChat5Min.splice(0, i);
	}
}

function sendToRoomChat(io, roomId, data) {
	io.in(roomId).emit("roomChatToClient", data);
	// io.in(socket.request.user.inRoomId).emit("player-ready", username + " is ready.");

	if (rooms[roomId]) {
		rooms[roomId].addToChatHistory(data);
	}
}

function isMuted(socket) {
	returnVar = false;
	currentModActions.forEach(function (oneModAction) {
		// console.log(oneModAction);
		if (oneModAction.type === "mute" && oneModAction.bannedPlayer && oneModAction.bannedPlayer.id && oneModAction.bannedPlayer.id.toString() === socket.request.user.id.toString()) {
			socket.emit("muteNotification", oneModAction);
			// console.log("TRUEEEE");

			returnVar = true;
			return;
		}
	});

	return returnVar;
}


function playerLeaveRoomCheckDestroy(socket) {

	if (socket.request.user.inRoomId && rooms[socket.request.user.inRoomId]) {
		//leave the room
		rooms[socket.request.user.inRoomId].playerLeaveRoom(socket);

		var toDestroy = rooms[socket.request.user.inRoomId].destroyRoom;

		if (toDestroy) {
			deleteSaveGameFromDb(rooms[socket.request.user.inRoomId]);

			// Stop bots thread if they are playing:
			if (rooms[socket.request.user.inRoomId].interval) {
				clearInterval(rooms[socket.request.user.inRoomId].interval);
				rooms[socket.request.user.inRoomId].interval = undefined;
			}

			rooms[socket.request.user.inRoomId] = undefined;
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
				deleteSaveGameFromDb(rooms[socket.request.user.inRoomId]);
				rooms[socket.request.user.inRoomId] = undefined;

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
	return null;
}
