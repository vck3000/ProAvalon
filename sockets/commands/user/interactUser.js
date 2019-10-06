
module.exports = {
    command: 'interactUser',
    help: '/interactUser <slap/buzz/lick> <playername>: Interact with a player.',
    run(globalState, data, senderSocket) {
        const { args } = data;

        const possibleInteracts = ['buzz', 'slap', 'lick', 'poke', 'punch'];
        if (possibleInteracts.indexOf(args[1]) === -1) {
            return { message: `You can only slap, buzz, poke, punch or lick, not ${args[1]}.`, classStr: 'server-text', dateCreated: new Date() };
        }

        const slapSocket = globalState.allSockets[getIndexFromUsername(globalState.allSockets, args[2], true)];
        if (slapSocket) {
            let verbPast = '';
            if (args[1] === 'buzz') { verbPast = 'buzzed'; } else if (args[1] === 'slap') { verbPast = 'slapped'; } else if (args[1] === 'lick') { verbPast = 'licked'; } else if (args[1] === 'poke') { verbPast = 'poked'; } else if (args[1] === 'punch') { verbPast = 'punched'; }

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
            if (senderSocket.request.user.inRoomId && globalState.rooms[senderSocket.request.user.inRoomId] && globalState.rooms[senderSocket.request.user.inRoomId].gameStarted === true) {
                slappedInGame = true;
                socketThatWasSlappedInGame = senderSocket;
            } else if (slapSocket.request.user.inRoomId && globalState.rooms[slapSocket.request.user.inRoomId] && globalState.rooms[slapSocket.request.user.inRoomId].gameStarted === true) {
                slappedInGame = true;
                socketThatWasSlappedInGame = slapSocket;
            }

            if (slappedInGame === true) {
                const str = `${senderSocket.request.user.username} has ${verbPast} ${slapSocket.request.user.username}. (In game)`;
                globalState.rooms[socketThatWasSlappedInGame.request.user.inRoomId].sendText(globalState.rooms[socketThatWasSlappedInGame.request.user.inRoomId].globalState.allSockets, str, 'server-text');
            }

            // {message: "You have " + verbPast + " " + args[2] + "!", classStr: "server-text"};
        } else {
            // console.log(globalState.allSockets);
            return { message: 'There is no such player.', classStr: 'server-text' };
        }
    },
};
