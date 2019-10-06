const forumThread = require('../models/forumThread');
const forumThreadComment = require('../models/forumThreadComment');
const forumThreadCommentReply = require('../models/forumThreadCommentReply');
const User = require('../models/user');
const modAction = require('../models/modAction');
const banIp = require('../models/banIp');

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

    next();
    
    // Check bans
    // const m = await modAction.findOne({ 'bannedPlayer.usernameLower': req.user.username.toLowerCase() }).exec();
    // if (!m) {
    //     const foundUser = await User.findOne({ username: req.user.username }).populate('notifications').exec();
    //     res.locals.currentUser = req.user;
    //     res.locals.userNotifications = foundUser.notifications;
    //     res.locals.mod = modsArray.includes(req.user.username.toLowerCase());
    //     res.locals.isMod = modsArray.includes(req.user.username.toLowerCase());
    //     next();
    //     return;
    // }

    // let message = `You have been banned. The ban will be released on ${m.whenRelease}. Ban description: '${m.descriptionByMod}'`;
    // message += ' Reflect on your actions.';
    // req.flash('error', message);
    // res.redirect('/');





    // TODO REMOVE THIS
    // exports.checkIpBan = asyncMiddleware(async (req, res, next) => {
    //     const clientIpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    //     const foundBannedIps = await banIp.find({}).exec();

    //     const bannedIps = (foundBannedIps || []).map((ip) => ip.bannedIp);
    //     const foundBannedIpsArray = (foundBannedIps || []).slice();

    //     if (!bannedIps.includes(clientIpAddress)) {
    //         next();
    //         return;
    //     }

    //     const index = bannedIps.indexOf(clientIpAddress);
    //     const username = (req.body.username || req.user.username).toLowerCase();

    //     if (!foundBannedIpsArray[index].usernamesAssociated) {
    //         foundBannedIpsArray[index].usernamesAssociated = [];
    //     }

    //     // if their username isnt associated with the ip ban, add their username to it for record.
    //     if (!foundBannedIpsArray[index].usernamesAssociated.includes(username)) {
    //         foundBannedIpsArray[index].usernamesAssociated.push(username);
    //     }

    //     foundBannedIpsArray[index].save();

    //     req.flash('error', 'You have been banned.');
    //     res.redirect('/');
    // });



});

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

exports.isLoggedIn = isLoggedIn;

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

exports.isMod = [isLoggedIn, (req, res, next) => {
    if (modsArray.includes(req.user.username.toLowerCase())) {
        next();
    } else {
        req.flash('error', 'You are not a moderator.');
        res.redirect('/');
    }
}];

exports.isAdmin = (req, res, next) => {
    if (admins.includes(req.user.username.toLowerCase())) {
        next();
    } else {
        req.flash('error', 'You are not an admin.');
        res.redirect('/');
    }
};

