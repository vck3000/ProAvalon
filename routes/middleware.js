const moment = require('moment');

const forumThread = require('../models/forumThread');
const forumThreadComment = require('../models/forumThreadComment');
const forumThreadCommentReply = require('../models/forumThreadCommentReply');
const User = require('../models/user');
const modAction = require('../models/modAction');
const banIp = require('../models/banIp');
const Ban = require('../models/ban');

const modsArray = require('../modsadmins/mods');
const admins = require('../modsadmins/admins');

// return a function that wraps an async middleware
const asyncMiddleware = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        console.log(err);
        req.flash('error', 'Something has gone wrong! Please contact a moderator or admin.');
        res.redirect('back');
    });
};

exports.asyncMiddleware = asyncMiddleware;

const isLoggedIn = asyncMiddleware(async (req, res, next) => {
    // Check if the user is logged in.
    if (!req.isAuthenticated()) {
        req.flash('error', 'Please log in to view this page.');
        res.redirect('/');
        return;
    }

    // Have to find the user to get notifications.
    const user = await User.findOne({ usernameLower: req.user.username.toLowerCase() }).populate('notifications').exec();
    const clientIpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(clientIpAddress);

    // Track IPs
    if (!user.IPAddresses.includes(clientIpAddress)) {
        user.IPAddresses.push(clientIpAddress);
        user.markModified("IPAdresses");
    }
    user.lastIPAddress = clientIpAddress;
    user.markModified("lastIPAddress");
    user.save();


    // Check bans!!!
    // USER ban
    ban = await Ban.findOne({
        'bannedPlayer.id': user._id,        // User ID match
        'whenRelease': {$gt: new Date() },  // Unexpired ban
        'userban': true,                    // User ban
        'disabled': false                   // Ban must be active
    });
    if (ban) {
        let message = `You have been banned. The ban will be released on ${moment(ban.whenRelease).format("LLL")}. Ban description: '${ban.descriptionByMod}'`;
        req.flash('error', message);
        res.redirect('/');

        // Track IPs
        if (!ban.bannedIPs.includes(clientIpAddress)) {
            ban.bannedIPs.push(clientIpAddress);
            ban.markModified("IPAdresses");
            ban.save();
        }
        return;
    }

    // IP ban
    ban = await Ban.findOne({
        'bannedIPs': clientIpAddress,       // IP match
        'whenRelease': {$gt: new Date() },  // Unexpired ban
        'ipban': true,                      // IP ban
        'disabled': false                   // Ban must be active
    });
    if (ban) {
        let message = `You have been banned. The ban will be released on ${moment(ban.whenRelease).format("LLL")}. Ban description: '${ban.descriptionByMod}'`;
        req.flash('error', message);
        res.redirect('/');
        return;
    }


    // Pass on some variables for all ejs files to use, mainly header partial view
    res.locals.currentUser = user;
    res.locals.userNotifications = user.notifications;
    res.locals.mod = modsArray.includes(user.username.toLowerCase());
    res.locals.isMod = modsArray.includes(user.username.toLowerCase());

    next();
});

exports.isLoggedIn = isLoggedIn;

const trackIP = asyncMiddleware(async (req, res, next) => {

});

exports.trackIP = trackIP;


const checkOwnership = (name, model, query, isOwner) => [
    isLoggedIn,
    asyncMiddleware(async (req, res, next) => {
        const found = await model.findOne(query(req)).exec();
        if (!found) {
            req.flash('error', `${name} not found`);
            res.redirect('back');
        } else if (isOwner(req, found)) {
            next();
        } else {
            console.log(`${req.user._id} ${req.user.username} has attempted to do something bad`);
            req.flash('error', 'You are not the owner!');
            res.redirect('back');
        }
    }),
];

exports.checkProfileOwnership = checkOwnership('User', User, (req) => ({
    username: req.params.profileUsername.replace(' ', ''),
}), (req, user) => user.username && user.username === req.user.username);

exports.checkForumThreadOwnership = checkOwnership('Thread', forumThread, (req) => ({
    _id: req.params.id,
}), (req, thread) => thread.author.id && thread.author.id.equals(req.user._id));

exports.checkForumThreadCommentOwnership = checkOwnership('Comment', forumThreadComment, (req) => ({
    _id: req.params.comment_id,
}), (req, comment) => comment.author.id && comment.author.id.equals(req.user._id));

exports.checkForumThreadCommentReplyOwnership = checkOwnership('Reply', forumThreadCommentReply, (req) => ({
    _id: req.params.reply_id,
}), (req, reply) => reply.author.id && reply.author.id.equals(req.user._id));

exports.isMod = isLoggedIn, (req, res, next) => {
    if (modsArray.includes(req.user.username.toLowerCase())) {
        next();
    } else {
        req.flash('error', 'You are not a moderator.');
        res.redirect('/');
    }
};

exports.isAdmin = (req, res, next) => {
    if (admins.includes(req.user.username.toLowerCase())) {
        next();
    } else {
        req.flash('error', 'You are not an admin.');
        res.redirect('/');
    }
};

