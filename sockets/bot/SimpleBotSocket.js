class SimpleBotSocket {
    constructor(username) {
        this.isBotSocket = true;
        this.request = {
            user: {
                username,
                bot: true,
            },
        };
    }

    // Dummy function needed.
    emit() { }

    // handleReadyNotReady: Called when the game is about to start.
    // if the bot is ready, call callback(true)
    // if the bot isn't ready, call callback(false) or callback(false, "<reason>")
    handleReadyNotReady(game, callback) {
        // Simple bots are always ready.
        callback(true);
    }

    // handleGameStart: Called when the game has commenced.
    // if the bot initialized successfully, call callback(true)
    // if the bot failed to initialize, call callback(false) or callback(false, "<reason>")
    handleGameStart(game, callback) {
        // Simple bots are always initialized.
        callback(true);
    }

    // handleRequestAction: Called when the server is requesting an action from your bot.
    // When you have a move available, call callback with the selected button and players
    // If you errored, call callback(false)
    handleRequestAction(game, availableButtons, availablePlayers, numOfTargets, callback) {
        // Simple bots play randomly
        const buttonPressed = availableButtons[Math.floor(Math.random() * availableButtons.length)];
        if (numOfTargets == 0) {
            callback({
                buttonPressed,
            });
        }

        // Progressively remove players until it is the right length
        const selectedPlayers = availablePlayers.slice();
        while (selectedPlayers.length > numOfTargets) {
            selectedPlayers.splice(Math.floor(Math.random() * selectedPlayers.length), 1);
        }

        callback({
            buttonPressed,
            selectedPlayers,
        });
    }

    // handleGameOver: Called when the game finishes or closes
    // If you want to leave the room, call callback(true)
    // Otherwise, call callback(false)
    handleGameOver(game, reason, callback) {
        callback(true);
    }
}

module.exports = SimpleBotSocket;
