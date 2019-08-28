// all middleware goes here
const forumThread = require('../models/forumThread');
const forumThreadComment = require('../models/forumThreadComment');
const forumThreadCommentReply = require('../models/forumThreadCommentReply');
const User = require('../models/user');
const modAction = require('../models/modAction');

const asyncMiddleware = require('./asyncMiddleware');
const modsArray = require('../modsadmins/mods');
const admins = require('../modsadmins/admins');

const isLoggedIn = asyncMiddleware(async (req, res, next) => {
    // Check if the user is logged in.
    if (!req.isAuthenticated()) {
        req.flash('error', 'Please log in to view this page.');
        res.redirect('/');
        return;
    }

    // Check bans
    const m = await modAction.findOne({ 'bannedPlayer.usernameLower': req.user.username.toLowerCase() }).exec();
    if (!m) {
        const foundUser = await User.findOne({ username: req.user.username }).populate('notifications').exec();
        res.locals.userNotifications = foundUser.notifications;
        res.locals.isMod = modsArray.includes(req.user.username.toLowerCase());
        next();
        return;
    }

    let message = `You have been banned. The ban will be released on ${m.whenRelease}. Ban description: '${m.descriptionByMod}'`;
    message += ' Reflect on your actions.';
    req.flash('error', message);
    res.redirect('/');
});

const checkOwnership = (name, model, query, isOwner) => [
    isLoggedIn,
    asyncMiddleware(async (req, res, next) => {
        const found = await model.findOne(query).exec();
        if (!found) {
            req.flash('error', `${name} not found`);
            res.redirect('back');
        } else if (isOwner(req, found)) {
            next();
        } else {
            req.flash('error', 'You are not the owner!');
            console.log(`${req.user._id} ${req.user.username} has attempted to do something bad`);
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
