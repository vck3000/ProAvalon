
var obj = {
    userCommands: {
        commandA: {
            command: "commandA",
            help: "/commandA: Just some text for commandA",
            run: function (data) {
                //do stuff
                return {message: "commandA has been run.", classStr: "server-text"};
            }
        },
    
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
    
                for (var key in obj.userCommands) {
                    if (obj.userCommands.hasOwnProperty(key)) {
                        if(!obj.userCommands[key].modsOnly){
                            // console.log(key + " -> " + p[key]);
                            dataToReturn[i] = {message: obj.userCommands[key].help, classStr: "server-text"};
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
            help: "/buzz <playername>: Buzz a player. <playername> must all be in lower case. (until I upgrade this)",
            run: function (data, senderSocket) {
                var args = data.args;
    
                var buzzSocket = allSockets[args[1]];
                if (buzzSocket) {
                    buzzSocket.emit("buzz", senderSocket.request.user.username);
                return {message: "You have buzzed player " + args[1] + ".", classStr: "server-text"};
                }
                else {
                    // console.log(allSockets);
                    return {message: "There is no such player.", classStr: "server-text"};
                }
            }
        },
    
        slap: {
            command: "slap",
            help: "/slap <playername>: Slap a player for fun. <playername> must all be in lower case. (until I upgrade this)",
            run: function (data, senderSocket) {
                var args = data.args;			
    
                var slapSocket = allSockets[args[1]];
                if (slapSocket) {
                    slapSocket.emit("slap", senderSocket.request.user.username);
                return {message: "You have slapped player " + args[1] + "!", classStr: "server-text"};
                }
                else {
                    // console.log(allSockets);
                    return {message: "There is no such player.", classStr: "server-text"};
                    
                }
            }
        },
    
        roomChat: {
            command: "roomChat",
            help: "/roomChat: Get a copy of the chat for the current game.",
            run: function (data, senderSocket) {
                var args = data.args;
                //code
                if(rooms[senderSocket.request.user.inRoomId]){
                    return rooms[senderSocket.request.user.inRoomId].getChatHistory();
    
                }
                else{
                    return {message: "The game hasn't started yet. There is no chat to display.", classStr: "server-text"}
                }
            }
        },
    
        allChat: {
            command: "allChat",
            help: "/allChat: Get a copy of the last 5 minutes of allChat.",
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
                if(args[1]){
                    if(isNaN(args[1]) === false){
                        return {message: (Math.floor(Math.random() * args[1]) + 1).toString(), classStr: "server-text"}
                    }
                    else{
                        return {message: "That is not a valid number!", classStr: "server-text"}	
                    }
                }
                
                else{
                    return {message: (Math.floor(Math.random() * 10) + 1).toString(), classStr: "server-text"}
                }
                
            }
        }
    
    },
    
    
    modCommands: {
        m: {
            command: "m",
            help: "/m: displays /mhelp",
            run: function (data, senderSocket) {
    
                return obj.modCommands["mhelp"].run(data, senderSocket);
            }
        },
        mban: {
            command: "mban",
            help: "/mban: Open the ban interface",
            run: function (data, senderSocket) {
    
                // console.log(senderSocket.request.user.username);
                if(modsArray.indexOf(senderSocket.request.user.username.toLowerCase()) !== -1){
                    senderSocket.emit("openModModal");
                    return {message: "May your judgement bring peace to all!", classStr: "server-text"};
                }
                else{
                    //add a report to this player.
                    return {message: "You are not a mod. Why are you trying this...", classStr: "server-text"};
                }
            }
        },
    
        modtest: {
            command: "modtest",
            help: "/modtest: Testing that only mods can access this command",
            run: function (data) {
                var args = data.args;
                //do stuff
                return {message: "modtest has been run.", classStr: "server-text"};
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
    
                for (var key in obj.modCommands) {
                    if (obj.modCommands.hasOwnProperty(key)) {
                        if(!obj.modCommands[key].modsOnly){
                            // console.log(key + " -> " + p[key]);
                            dataToReturn[i] = {message: obj.modCommands[key].help, classStr: "server-text"};
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
    
                if(!args[1]){
                    return {message: "Specify a username.", classStr: "server-text"}
                }
    
                modAction.find({'bannedPlayer.username': args[1]}, function(err, foundModAction){
                    console.log("foundmodaction");
                    console.log(foundModAction);
                    if(foundModAction.length !== 0){
                        modAction.remove({'bannedPlayer.username': args[1]},function(err, foundModAction){
                            if(err){
                                console.log(err);
                                senderSocket.emit("messageCommandReturnStr", {message: "Something went wrong.", classStr: "server-text"});
                            }
                            else{
                                console.log("Successfully unbanned " + args[1] + ".");
                                senderSocket.emit("messageCommandReturnStr", {message: "Successfully unbanned " + args[1] + ".", classStr: "server-text"});					
    
    
                                //load up all the modActions that are not released yet
                                modAction.find({whenRelease: {$gt: new Date()}, type: "mute"}, function(err, allModActions){
                                    currentModActions = [];
                                    for(var i = 0; i < allModActions.length; i++){
                                        currentModActions.push(allModActions[i]);
                                    }
                                    console.log("mute");
                                    console.log(currentModActions);
                                });
                            }
                        });
                    }
                    else{
                        senderSocket.emit("messageCommandReturnStr", {message: args[1] + " does not have a ban.", classStr: "server-text"});
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
    
                modAction.find({}, function(err, foundModActions){
                    foundModActions.forEach(function(modActionFound){
                        var message = modActionFound.bannedPlayer.username + " was banned for " + modActionFound.reason + " by " + modActionFound.modWhoBanned.username + ": '" + modActionFound.descriptionByMod + "' until: " + modActionFound.whenRelease.toString();
    
                        dataToReturn[dataToReturn.length] = {message: message, classStr: "server-text"};
                    });
    
                    if(dataToReturn.length === 0){
                        senderSocket.emit("messageCommandReturnStr", {message: "No one is banned! Yay!", classStr: "server-text"});
                    }
                    else{
                        senderSocket.emit("messageCommandReturnStr", dataToReturn);
                    }
    
                });
    
    
    
    
                // for (var key in modCommands) {
                // 	if (modCommands.hasOwnProperty(key)) {
                // 		if(!modCommands[key].modsOnly){
                // 			// console.log(key + " -> " + p[key]);
                // 			dataToReturn[i] = {message: modCommands[key].help, classStr: "server-text"};
                // 			// str[i] = userCommands[key].help;
                // 			i++;
                // 			//create a break in the chat
                // 			// data[i] = {message: "-------------------------", classStr: "server-text"};
                // 			// i++;
                // 		}
                // 	}
                // }
                // return dataToReturn;
                
            }
        },
    
    
    
    
        
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
    
                for (var key in obj.adminCommands) {
                    if (obj.adminCommands.hasOwnProperty(key)) {
                        if(!obj.adminCommands[key].modsOnly){
                            // console.log(key + " -> " + p[key]);
                            dataToReturn[i] = {message: obj.adminCommands[key].help, classStr: "server-text"};
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
                return {message: "admintest has been run.", classStr: "server-text"};
            }
        },
    
        aServerRestartWarning: {
            command: "aServerRestartWarning",
            help: "/aServerRestartWarning: Only for the admin to use :)",
            run: function (data, senderSocket) {
                var args = data.args;
                // console.log(allSockets);
                //code
                if(senderSocket.request.user.username === "ProNub"){
    
                    for(var key in allSockets){
                        if(allSockets.hasOwnProperty(key)){
                            allSockets[key].emit("serverRestartWarning")
                        }
                    }
    
                    var numOfGamesSaved = 0;
                    var numOfGamesEncountered = 0;
                    var promises = [];
    
                    //save the games
                    for(var i = 0; i < rooms.length; i++){
                        if(rooms[i] && rooms[i].gameStarted === true){
                            console.log("rooms");
                            console.log(rooms[i]);
                            
                            savedGameObj.create({room: JSON.stringify(rooms[i])}, function(err, savedGame){
                                if(err){
                                    console.log(err);
                                }
                                console.log(savedGame);
                                numOfGamesSaved++;
    
                                console.log("created");
                                console.log(numOfGamesSaved >= numOfGamesEncountered);
                                console.log(numOfGamesSaved);
                                console.log(numOfGamesEncountered);
    
                                if(numOfGamesSaved >= numOfGamesEncountered){
                                    var data = {message: "Successful. Saved " + numOfGamesSaved + " games.", classStr: "server-text"};
                                    senderSocket.emit("messageCommandReturnStr", data);
                                }
    
                            });
                            numOfGamesEncountered++;
                        }
                    }
    
                    console.log(numOfGamesEncountered);
                    
                    if(numOfGamesEncountered === 0){
                        return {message: "Successful. But no games needed to be saved.", classStr: "server-text"};
                    }
                    else{
                        return {message: "Successful. But still saving games.", classStr: "server-text"};
                    }
    
                }
                else{
                    return {message: "You are not the admin...", classStr: "server-text"};
                }
            }
        }
    }
}


module.exports = obj;