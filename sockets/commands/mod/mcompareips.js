
module.exports = {
    command: 'mcompareips',
    help: '/mcompareips: Get usernames of players with the same IP.',
    async run(globalState, data, senderSocket) {
        const usernames = [];
        const ips = [];

        for (let i = 0; i < globalState.allSockets.length; i += 1) {
            const sock = globalState.allSockets[i];
            usernames.push(sock.request.user.username);

            const clientIpAddress = sock.request.headers['x-forwarded-for'] || sock.request.connection.remoteAddress;
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
            dataToReturn[0] = { message: 'There are no users with matching IPs.', classStr: 'server-text', dateCreated: new Date() };
        } else {
            dataToReturn[0] = { message: '-------------------------', classStr: 'server-text', dateCreated: new Date() };

            for (let i = 0; i < duplicateIps.length; i += 1) {
                // for each ip, search through the whole users to see who has the ips

                for (let j = 0; j < ips.length; j += 1) {
                    if (ips[j] === duplicateIps[i]) {
                        dataToReturn.push({ message: usernames[j], classStr: 'server-text', dateCreated: new Date() });
                    }
                }
                dataToReturn.push({ message: '-------------------------', classStr: 'server-text', dateCreated: new Date() });
            }
        }
        senderSocket.emit('messageCommandReturnStr', dataToReturn);
    },
};
