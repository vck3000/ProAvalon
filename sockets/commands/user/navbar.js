module.exports = {
    command: 'navbar',
    help: '/navbar: Hides and unhides the top navbar. Some phone screens may look better with the navbar turned off.',
    run(globalState, data, senderSocket) {
        senderSocket.emit('toggleNavBar');
    },
};
