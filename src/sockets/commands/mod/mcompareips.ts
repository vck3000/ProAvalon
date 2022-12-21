import { Command } from '../types';
import { allSockets } from '../../sockets';

export const mcompareips: Command = {
  command: 'mcompareips',
  help: '/mcompareips: Get usernames of players with the same IP.',
  run: async (args, senderSocket) => {
    const usernames = [];
    const ips = [];

    for (let i = 0; i < allSockets.length; i++) {
      // @ts-ignore
      usernames.push(allSockets[i].request.user.username);

      let clientIpAddress =
        allSockets[i].request.headers['x-forwarded-for'] ||
        allSockets[i].request.connection.remoteAddress;

      if (Array.isArray(clientIpAddress)) {
        clientIpAddress = clientIpAddress[0];
      }

      ips.push(clientIpAddress);
    }

    const uniq = ips
      .map((ip) => ({ count: 1, ip: ip }))
      .reduce<Record<string, number>>((a, b) => {
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

      for (let i = 0; i < duplicateIps.length; i++) {
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
};
