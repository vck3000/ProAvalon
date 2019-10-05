
module.exports = {
    command: 'pmmod',
    help: '/pmmod <mod_username> <message>: Sends a private message to an online moderator.',
    run(data, senderSocket) {
        const { args } = data;
        // We check if they are spamming, i.e. have sent a PM before the timeout is up
        const lastPmTime = pmmodCooldowns[senderSocket.id];
        if (lastPmTime) {
            const remaining = new Date() - lastPmTime;
            if (remaining < PMMOD_TIMEOUT) return { message: `Please wait ${Math.ceil((PMMOD_TIMEOUT - remaining) / 1000)} seconds before sending another pm!`, classStr: 'server-text' };
        }
        // Checks for various missing fields or errors
        if (!args[1]) return { message: 'Please specify a mod to message. Type /mods to get a list of online mods.', classStr: 'server-text' };
        if (!args[2]) return { message: 'Please specify a message to send.', classStr: 'server-text' };
        const modSocket = allSockets[getIndexFromUsername(allSockets, args[1], true)];
        if (!modSocket) return { message: `Could not find ${args[1]}.`, classStr: 'server-text' };
        if (modSocket.id === senderSocket.id) return { message: 'You cannot private message yourself!', classStr: 'server-text' };
        if (!modsArray.includes(args[1].toLowerCase())) return { message: `${args[1]} is not a mod. You may not private message them.`, classStr: 'server-text' };

        const str = `${senderSocket.request.user.username}->${modSocket.request.user.username} (pmmod): ${args.slice(2).join(' ')}`;

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
    },
};
