// TODO REMOVE THIS
exports.checkIpBan = asyncMiddleware(async (req, res, next) => {
    const clientIpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const foundBannedIps = await banIp.find({}).exec();

    const bannedIps = (foundBannedIps || []).map((ip) => ip.bannedIp);
    const foundBannedIpsArray = (foundBannedIps || []).slice();

    if (!bannedIps.includes(clientIpAddress)) {
        next();
        return;
    }

    const index = bannedIps.indexOf(clientIpAddress);
    const username = (req.body.username || req.user.username).toLowerCase();

    if (!foundBannedIpsArray[index].usernamesAssociated) {
        foundBannedIpsArray[index].usernamesAssociated = [];
    }

    // if their username isnt associated with the ip ban, add their username to it for record.
    if (!foundBannedIpsArray[index].usernamesAssociated.includes(username)) {
        foundBannedIpsArray[index].usernamesAssociated.push(username);
    }

    foundBannedIpsArray[index].save();

    req.flash('error', 'You have been banned.');
    res.redirect('/');
});
