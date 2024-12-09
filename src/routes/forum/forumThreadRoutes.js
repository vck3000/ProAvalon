import { Router } from 'express';
import sanitizeHtml from 'sanitize-html';
import rateLimit from 'express-rate-limit';

import { config } from '../../config';
import { checkForumThreadOwnership, asyncMiddleware } from '../middleware';
import getTimeDiffInString from '../../util/getTimeDiffInString';
import lastIds from '../../models/lastIds';
import forumThread from '../../models/forumThread';
import { allowedHtmlTags, allowedHtmlAttributes } from './sanitizeRestrictions';
import REWARDS from '../../rewards/constants';
import { userHasReward } from '../../rewards/getRewards';

// Prevent too many requests
const router = new Router();

router.get(
  '/show/:id',
  asyncMiddleware(async (req, res) => {
    const foundForumThread = await forumThread
      .findById(req.params.id)
      .populate({ path: 'comments', populate: { path: 'replies' } })
      .exec();

    if (!foundForumThread) {
      res.redirect('/forum');
      return;
    }

    // update the time since string for forumThread
    foundForumThread.timeSinceString = getTimeDiffInString(
      foundForumThread.timeLastEdit,
    );

    // update the time since string for each comment
    foundForumThread.comments.forEach((comment) => {
      comment.timeSinceString = getTimeDiffInString(comment.timeLastEdit);

      // update the time since string for each reply to a comment
      comment.replies.forEach((reply) => {
        reply.timeSinceString = getTimeDiffInString(reply.timeLastEdit);
      });
    });

    const userIdString = req.user._id.toString().replace(' ', '');

    const idsOfLikedPosts = [];
    const addToLikedPosts = (item) => {
      if (!item.whoLikedId) return;
      item.whoLikedId.forEach((liker) => {
        if (liker.toString().replace(' ', '') === userIdString) {
          idsOfLikedPosts[0] = foundForumThread._id;
        }
      });
    };

    // have they liked the main post already?
    addToLikedPosts(foundForumThread);
    foundForumThread.comments.forEach((comment) => {
      addToLikedPosts(comment);
      comment.replies.forEach(addToLikedPosts);
    });

    // if the forumthread is disabled and  the person is not a mod, then don't show
    if (foundForumThread.disabled && !res.locals.mod) {
      req.flash('error', 'Thread has been deleted.');
      res.redirect('/forum/page/1');
      return;
    }
    res.render('forum/show', {
      forumThread: foundForumThread,
      idsOfLikedPosts,
    });

    // Below is seen/unseen code

    // if there is no seen users array, create it and add the user
    if (!foundForumThread.seenUsers) foundForumThread.seenUsers = [];
    // if the viewing user isnt on the list, then add them.
    if (!foundForumThread.seenUsers.includes(req.user.username.toLowerCase())) {
      foundForumThread.seenUsers.push(req.user.username.toLowerCase());
    }

    // for every comment, add the user to seen users
    foundForumThread.comments.forEach(async (comm) => {
      let changesMade = false;

      // see all the comments
      if (!comm.seenUsers) comm.seenUsers = [];
      // if the user isnt on the list, add them. otherwise no need.
      if (comm.seenUsers.indexOf(req.user.username.toLowerCase()) === -1) {
        comm.seenUsers.push(req.user.username.toLowerCase());
        changesMade = true;
      }
      // see all the replies
      comm.replies.forEach(async (rep) => {
        if (!rep.seenUsers) {
          rep.seenUsers = [];
        }
        // if the user isnt on the list, add them. otherwise no need.
        if (rep.seenUsers.indexOf(req.user.username.toLowerCase()) === -1) {
          rep.seenUsers.push(req.user.username.toLowerCase());
          changesMade = true;
          await rep.save();
        }
      });

      // only need to comm.save() if there was a change.
      // otherwise save some resources and skip saving.
      if (changesMade) {
        comm.markModified('replies');
        await comm.save();
      }
    });
    // there is always at least one change, so just save.
    foundForumThread.markModified('comments');
    foundForumThread.save();
  }),
);

router.get('/new', (req, res) => {
  res.render('forum/new');
});

// if this is the first.
lastIds.findOne({}).exec(async (err, returnedLastId) => {
  if (!returnedLastId) {
    await lastIds.create({ number: 1 });
  }
});

const newForumLimiter =
  config.ENV === 'local'
    ? rateLimit({
        max: 0, // Disable if we are local
      })
    : rateLimit({
        windowMs: 12 * 60 * 60 * 1000, // 12 hours
        max: 3,
      });

/** ******************************************************* */
// Create a new forumThread
/** ******************************************************* */
router.post(
  '/',
  newForumLimiter,
  asyncMiddleware(async (req, res) => {
    let CAN_POST = await userHasReward(req.user, REWARDS.CAN_ADD_FORUM);
    if (!CAN_POST) {
      req.flash('error', 'You need 10 games to create a forum thread.');
      res.redirect('back');
      return;
    }

    // return;
    // get the category based on the user selection
    let category = '';
    if (req.body.avalon) {
      category = 'avalon';
    } else if (req.body.offTopic) {
      category = 'offTopic';
    } else if (req.body.suggestion) {
      category = 'suggestion';
    } else if (req.body.bug) {
      category = 'bug';
    } else {
      category = 'offTopic';
    }

    // grab the next number id from db
    const returnedLastId = await lastIds.findOne({}).exec();
    if (!returnedLastId) {
      await lastIds.create({ number: 1 });
    }

    const { number } = returnedLastId;
    returnedLastId.number += 1;
    await returnedLastId.save();

    const newForumThread = {
      title: sanitizeHtml(req.body.title),
      description: sanitizeHtml(req.body.description, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(allowedHtmlTags),
        allowedAttributes: allowedHtmlAttributes,
      }),
      hoursSinceLastEdit: 0,
      timeCreated: new Date(),
      likes: 0,
      numOfComments: 0,
      timeLastEdit: new Date(),
      whoLastEdit: req.user.username,
      author: {
        id: req.user._id,
        username: req.user.username,
      },
      comments: [],
      category,
      numberId: number,
    };

    // create a new campground and save to DB
    await forumThread.create(newForumThread);
    // redirect back to campgrounds page
    res.redirect('/forum');
  }),
);

/** ******************************************************* */
// Show the edit forumThread route
/** ******************************************************* */
router.get(
  '/:id/edit',
  checkForumThreadOwnership,
  asyncMiddleware(async (req, res) => {
    const foundForumThread = await forumThread.findById(req.params.id);
    if (foundForumThread.disabled) {
      req.flash('error', 'You cannot edit a deleted forum thread.');
      res.redirect('back');
    } else {
      res.render('forum/edit', { forumThread: foundForumThread });
    }
  }),
);

/** ******************************************************* */
// Update the forumThread route
/** ******************************************************* */
router.put(
  '/:id',
  checkForumThreadOwnership,
  asyncMiddleware(async (req, res) => {
    // find and update the correct campground

    let category = '';
    let categoryChange = false;
    if (req.body.avalon) {
      category = 'avalon';
      categoryChange = true;
    } else if (req.body.offTopic) {
      category = 'offTopic';
      categoryChange = true;
    } else if (req.body.suggestion) {
      category = 'suggestion';
      categoryChange = true;
    } else if (req.body.bug) {
      category = 'bug';
      categoryChange = true;
    }

    // Even though EJS <%= %> doesn't allow for injection, it still displays and in case it fails,
    // we should sanitize the title anyway.

    const foundForumThread = await forumThread.findById(req.params.id).exec();

    if (foundForumThread.disabled) {
      req.flash('error', 'You cannot edit a deleted forum thread.');
      res.redirect('back');
      return;
    }

    // update the category
    if (categoryChange) foundForumThread.category = category;

    // add the required changes for an edit
    foundForumThread.edited = true;
    foundForumThread.timeLastEdit = new Date();
    foundForumThread.whoLastEdit = req.user.username;

    // sanitize the description once again
    foundForumThread.description = sanitizeHtml(
      req.body.forumThread.description,
      {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(allowedHtmlTags),
        allowedAttributes: allowedHtmlAttributes,
      },
    );

    foundForumThread.title = sanitizeHtml(req.body.forumThread.title);
    await foundForumThread.save();

    res.redirect(`/forum/show/${foundForumThread.id}`);
  }),
);

/** ******************************************************* */
// Destroy the forumThread route
/** ******************************************************* */
router.delete(
  '/deleteForumThread/:id',
  checkForumThreadOwnership,
  asyncMiddleware(async (req, res) => {
    const foundForumThread = await forumThread.findById(req.params.id).exec();
    if (foundForumThread.disabled) {
      req.flash('error', 'You cannot edit a deleted forum thread.');
      res.redirect('back');
      return;
    }

    foundForumThread.disabled = true;
    foundForumThread.save();

    res.redirect('/forum');
  }),
);

export default router;
