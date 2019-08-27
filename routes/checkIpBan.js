const banIp = require('../models/banIp');

let bannedIps = [];
let foundBannedIpsArray = [];

function updateBannedIps() {
    return banIp.find({}, (err, foundBannedIps) => {
        if (err) { console.log(err); } else {
            bannedIps = [];
            foundBannedIpsArray = [];
            // console.log(foundBannedIps);
            if (foundBannedIps) {
                foundBannedIps.forEach((oneBannedIp) => {
                    bannedIps.push(oneBannedIp.bannedIp);
                    foundBannedIpsArray.push(oneBannedIp);
                });
            }
        }
    }).exec();
}

async function checkIpBan(req, res, next) {
    const clientIpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await updateBannedIps();

    if (bannedIps.indexOf(clientIpAddress) === -1) {
        // console.log("NEXT");
        next();
    } else {
        const index = bannedIps.indexOf(clientIpAddress);

        let username = req.body.username || req.user.username;
        username = username.toLowerCase();

        if (!foundBannedIpsArray[index].usernamesAssociated) {
            foundBannedIpsArray[index].usernamesAssociated = [];
        }

        // if their username isnt associated with the ip ban, add their username to it for record.
        if (foundBannedIpsArray[index].usernamesAssociated.indexOf(username) === -1) {
            foundBannedIpsArray[index].usernamesAssociated.push(username);
        }

        foundBannedIpsArray[index].save();


        req.flash('error', 'You have been banned.');
        res.redirect('/');
    }
}

module.exports = checkIpBan;
