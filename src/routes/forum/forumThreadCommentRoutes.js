import { Router } from 'express';
import sanitizeHtml from 'sanitize-html';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import forumThread from '../../models/forumThread';
import forumThreadComment from '../../models/forumThreadComment';
import {
  asyncMiddleware,
  checkForumThreadCommentOwnership,
} from '../middleware';
import { allowedHtmlAttributes, allowedHtmlTags } from './sanitizeRestrictions';
import { createNotification } from '../../myFunctions/createNotification';
import REWARDS from '../../rewards/constants';
import { userHasReward } from '../../rewards/getRewards';

const router = new Router();

const newCommentLimiter =
  process.env.ENV === 'local'
    ? rateLimit({
        max: 0, // Disable if we are local
      })
    : rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hours
        max: 10,
      });

/** ******************************************************* */
// Create new comment route
/** ******************************************************* */
router.post(
  '/:id/comment',
  newCommentLimiter,
  asyncMiddleware(async (req, res) => {
    let CAN_POST = await userHasReward(req.user, REWARDS.CAN_ADD_FORUM);
    if (!CAN_POST) {
      req.flash('error', 'You need 10 games to comment on a forum thread.');
      res.redirect('back');
      return;
    }

    const commentData = {
      text: sanitizeHtml(req.body.comment.text, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(allowedHtmlTags),
        allowedAttributes: allowedHtmlAttributes,
      }),
      author: { id: req.user._id, username: req.user.username },
      timeCreated: new Date(),
      timeLastEdit: new Date(),
      likes: 0,
      whoLiked: [],
      replies: [],

      // the creator has already seen it
      seenUsers: [req.user.username.toLowerCase()],
    };

    const newComment = await forumThreadComment.create(commentData);
    const foundForumThread = await forumThread
      .findById(mongoose.Types.ObjectId(req.params.id))
      .populate('comments')
      .exec();
    foundForumThread.comments.push(newComment);
    // add 1 to the num of comments
    foundForumThread.numOfComments += 1;
    // update time last edited
    foundForumThread.timeLastEdit = new Date();
    foundForumThread.whoLastEdit = req.user.username;

    // now saving down the bottom
    // foundForumThread.save();

    // console.log(foundForumThread.author.id)

    // Set up a new notification
    console.log(foundForumThread.author);
    if (foundForumThread.author.id) {
      // create notif
      const userIdTarget = mongoose.Types.ObjectId(foundForumThread.author.id);
      const stringToSay = `${req.user.username} has commented on your post.`;
      const link = `/forum/show/${foundForumThread._id}#${newComment._id}`;

      createNotification(userIdTarget, stringToSay, link, req.user.username);
    }

    // redirect to same forum thread
    res.redirect(`/forum/show/${req.params.id}`);

    // since there is a new comment, the thread is now refreshed and no one has seen the
    // new changes yet, except for the one who made the comment
    foundForumThread.seenUsers = [req.user.username.toLowerCase()];
    foundForumThread.save();
  }),
);

/** ******************************************************* */
// Show the edit a comment page
/** ******************************************************* */
router.get(
  '/:id/:comment_id/edit',
  checkForumThreadCommentOwnership,
  asyncMiddleware(async (req, res) => {
    const foundComment = await forumThreadComment
      .findById(req.params.comment_id)
      .exec();
    if (foundComment.disabled) {
      req.flash('error', 'Comment has been deleted.');
      res.redirect('back');
      return;
    }
    res.render('forum/comment/edit', {
      comment: foundComment,
      forumThread: { id: req.params.id },
    });
  }),
);

/** ******************************************************* */
// Update a comment route
/** ******************************************************* */
router.put(
  '/:id/:comment_id',
  checkForumThreadCommentOwnership,
  asyncMiddleware(async (req, res) => {
    // find and update the correct campground

    const foundComment = await forumThreadComment
      .findById(req.params.comment_id)
      .exec();
    if (foundComment.disabled) {
      req.flash('error', 'You cannot edit a deleted comment.');
      // make them refresh to see the req.flash;
      res.redirect('back');
      return;
    }

    foundComment.text = sanitizeHtml(req.body.comment.text, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(allowedHtmlTags),
      allowedAttributes: allowedHtmlAttributes,
    });
    foundComment.edited = true;
    foundComment.timeLastEdit = new Date();

    await foundComment.save();

    const foundForumThread = await forumThread
      .findById(req.params.id)
      .populate('comments')
      .exec();
    foundForumThread.markModified('comments');
    foundForumThread.whoLastEdit = req.user.username;
    // update time last edited
    foundForumThread.timeLastEdit = new Date();

    await foundForumThread.save();

    res.redirect(`/forum/show/${req.params.id}`);
  }),
);

/** ******************************************************* */
// Destroy a comment route
/** ******************************************************* */
router.delete(
  '/deleteComment/:id/:comment_id',
  checkForumThreadCommentOwnership,
  asyncMiddleware(async (req, res) => {
    const foundComment = await forumThreadComment.findById(
      req.params.comment_id,
    );
    if (foundComment.disabled) {
      req.flash('error', 'Comment has already been deleted.');
      res.redirect('back');
      return;
    }
    // console.log('Deleted (disabled) a comment by author.');
    // console.log(`Thread id ${req.params.id}`);

    foundComment.disabled = true;
    foundComment.oldText = foundComment.text;
    foundComment.text = '*Deleted*';

    await foundComment.save();

    const foundForumThread = await forumThread
      .findById(req.params.id)
      .populate('comments')
      .exec();
    foundForumThread.markModified('comments');
    await foundForumThread.save();

    res.redirect(`/forum/${req.params.id}`);
  }),
);

export default router;
