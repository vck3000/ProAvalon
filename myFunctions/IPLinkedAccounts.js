const User = require('../models/user');

IPLinkedAccounts = async (username) => {

    var linkedUsernames = [];

    var IPsToVisit = []
    var visitedIPs = [];
    
    // Track down each user account linked to all IPs.
    // Only need too return usernameLower and IPAddresses from the query
    const user = await User.findOne({'usernameLower': username.toLowerCase()}, 'usernameLower IPAddresses');
    if (user) {
        linkedUsernames.push(user.usernameLower);
        IPsToVisit = user.IPAddresses;
        // console.log(user);
    
        while (IPsToVisit.length !== 0) {
            const nextIP = IPsToVisit.pop();
            // Skip IP's that we have visited already.
            if (visitedIPs.includes(nextIP)) {
                continue;
            }
    
            const linkedUsers = await User.find({'IPAddresses': nextIP}, 'usernameLower IPAddresses');
            visitedIPs.push(nextIP);
            for (u of linkedUsers) {
                // If this user hasn't been checked yet, add their username to the list and their IPs.
                if(!linkedUsernames.includes(u.usernameLower)) {
                    linkedUsernames.push(u.usernameLower);
                    IPsToVisit = IPsToVisit.concat(u.IPAddresses);
                }
            }
    
            // console.log("Checking IP " + nextIP);
        }
        const returnObj = {
            linkedUsernames: linkedUsernames,
            linkedIPs: visitedIPs,
            target: username
        };

        return returnObj;
    }
    else{
        throw new Error("Could not find user " + username + ".");
    }
}

module.exports = IPLinkedAccounts;