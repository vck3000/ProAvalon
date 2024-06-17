// @ts-nocheck
import forumThread from '../models/forumThread';
import forumThreadComment from '../models/forumThreadComment';
import forumThreadCommentReply from '../models/forumThreadCommentReply';
import User from '../models/user';
import Ban from '../models/ban';
import { isMod } from '../modsadmins/mods';
import { isAdmin } from '../modsadmins/admins';

import { RequestHandler } from 'express';
import { configOld } from '../config';

// return a function that wraps an async middleware
export const asyncMiddleware =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.log(err);
      req.flash(
        'error',
        'Something has gone wrong! Please contact a moderator or admin.',
      );
      res.redirect('back');
    });
  };

export const isLoggedIn = asyncMiddleware(async (req, res, next) => {
  // Check if the user is logged in.
  if (!req.isAuthenticated()) {
    req.flash('error', 'Please log in to view this page.');
    res.redirect('/');
    return;
  }

  const user = await User.findOne({
    usernameLower: req.user.username.toLowerCase(),
  })
    .populate('notifications')
    .exec();
  // Pass on some variables for all ejs files to use, mainly header partial view
  res.locals.currentUser = user;
  res.locals.userNotifications = user.notifications;
  res.locals.mod = isMod(user.username);
  res.locals.isMod = isMod(user.username);

  // Tag the session document in MongoDb with their username
  // to be able to look it up later when invalidating sessions.
  if (!req.session.usernameLower) {
    req.session.usernameLower = user.usernameLower;
    await req.session.save();
  }

  if (req.session.banCheckPassed === true) {
    next();
  } else {
    const clientIpAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Track IPs
    if (
      clientIpAddress !== null &&
      clientIpAddress !== undefined &&
      !user.IPAddresses.includes(clientIpAddress)
    ) {
      user.IPAddresses.push(clientIpAddress);
      user.markModified('IPAdresses');

      user.lastIPAddress = clientIpAddress;
      user.markModified('lastIPAddress');
      await user.save();
    }

    // Don't check over multiple times. Once is enough per person per request.
    if (!res.locals.bansChecked) {
      res.locals.bansChecked = true;
      // Check bans
      const ban = await Ban.findOne({
        'bannedPlayer.id': user._id, // User ID match
        whenRelease: { $gt: new Date() }, // Unexpired ban
        userBan: true, // User ban
        disabled: false, // Ban must be active
      });
      if (ban) {
        let message = `You have been banned. The ban will be released on &${ban.whenRelease.getTime()}*. Ban description: '${
          ban.descriptionByMod
        }'`;
        req.flash('error', message);
        res.redirect('/');
        return;
      }

      if (clientIpAddress !== null && clientIpAddress !== undefined) {
        // IP ban
        const ban = await Ban.findOne({
          bannedIPs: clientIpAddress, // IP match
          whenRelease: { $gt: new Date() }, // Unexpired ban
          ipBan: true, // IP ban
          disabled: false, // Ban must be active
        });
        if (ban) {
          let message = `You have been banned. The ban will be released on &${ban.whenRelease.getTime()}*. Ban description: '${
            ban.descriptionByMod
          }'`;
          req.flash('error', message);
          res.redirect('/');
          return;
        }
      }

      // Due to performance issues and massive sprawling bans, this has been disabled.
      // // Check ALL the possible linked usernames and IPs they could have possibly ever been logged on
      // const { linkedUsernames, linkedIPs } = await IPLinkedAccounts(user.usernameLower);
      // ban = await Ban.findOne({
      //     'usernameLower': {                  // Username match
      //         $in: linkedUsernames
      //     },
      //     'whenRelease': {$gt: new Date() },  // Unexpired ban
      //     'userBan': true,                    // User ban
      //     'disabled': false                   // Ban must be active
      // });
      // if (ban && ban.singleIPBan === false) {
      //     let message = `You have been banned. The ban will be released on &${ban.whenRelease.getTime()}*. Ban description: '${ban.descriptionByMod}'`;
      //     req.flash('error', message);
      //     res.redirect('/');
      //     return;
      // }

      // // Check all ips.
      // for (ip of linkedIPs) {
      //     ban = await Ban.findOne({
      //         'bannedIPs': ip,                    // IP match
      //         'whenRelease': {$gt: new Date() },  // Unexpired ban
      //         'ipBan': true,                      // IP ban
      //         'disabled': false                   // Ban must be active
      //     });
      //     if (ban && ban.singleIPBan === false) {
      //         let message = `You have been banned. The ban will be released on &${ban.whenRelease.getTime()}*. Ban description: '${ban.descriptionByMod}'`;
      //         req.flash('error', message);
      //         res.redirect('/');
      //         return;
      //     }
      // }
    }

    req.session.banCheckPassed = true;

    next();
  }
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
      console.log(
        `${req.user._id} ${req.user.username} has attempted to do something bad`,
      );
      req.flash('error', 'You are not the owner!');
      res.redirect('back');
    }
  }),
];

export const checkProfileOwnership = checkOwnership(
  'User',
  User,
  (req) => ({
    username: req.params.profileUsername.replace(' ', ''),
  }),
  (req, user) => user.username && user.username === req.user.username,
);

export const checkForumThreadOwnership = checkOwnership(
  'Thread',
  forumThread,
  (req) => ({
    _id: req.params.id,
  }),
  (req, thread) => thread.author.id && thread.author.id.equals(req.user._id),
);

export const checkForumThreadCommentOwnership = checkOwnership(
  'Comment',
  forumThreadComment,
  (req) => ({
    _id: req.params.comment_id,
  }),
  (req, comment) => comment.author.id && comment.author.id.equals(req.user._id),
);

export const checkForumThreadCommentReplyOwnership = checkOwnership(
  'Reply',
  forumThreadCommentReply,
  (req) => ({
    _id: req.params.reply_id,
  }),
  (req, reply) => reply.author.id && reply.author.id.equals(req.user._id),
);

export const isModMiddleware = (req, res, next) => {
  if (isMod(req.user.username)) {
    next();
  } else {
    req.flash('error', 'You are not a moderator.');
    res.redirect('/');
  }
};

export const isAdminMiddleware = (req, res, next) => {
  if (isAdmin(req.user.username)) {
    next();
  } else {
    req.flash('error', 'You are not an admin.');
    res.redirect('/');
  }
};

export const emailVerified = (req, res, next) => {
  if (req.user.emailVerified === true || configOld.getEnv() != 'prod') {
    next();
  } else {
    res.redirect('/emailVerification');
  }
};
