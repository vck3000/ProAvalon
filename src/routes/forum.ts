// @ts-nocheck
import { Router } from 'express';
import { Types } from 'mongoose';
import forumThread from '../models/forumThread';
import forumThreadComment from '../models/forumThreadComment';
import forumThreadCommentReply from '../models/forumThreadCommentReply';
import ForumBan from '../models/forumBan';
import ModLog from '../models/modLog';
import pinnedThread from '../models/pinnedThread';
import { isModMiddleware, asyncMiddleware } from './middleware';
import getTimeDiffInString from '../util/getTimeDiffInString';
import { createNotification } from '../myFunctions/createNotification';
import { isMod } from '../modsadmins/mods';
import forumThreadRoutes from '../routes/forum/forumThreadRoutes';
import forumThreadCommentRoutes from '../routes/forum/forumThreadCommentRoutes';
import forumThreadCommentReplyRoutes from '../routes/forum/forumThreadCommentReplyRoutes';
import REWARDS from '../rewards/constants';
import { userHasReward } from '../rewards/getRewards';

const router = Router();

router.use(forumThreadRoutes);
router.use(forumThreadCommentRoutes);
router.use(forumThreadCommentReplyRoutes);

router.get('/', (req, res) => {
  res.redirect('/forum/page/1');
});

// Player liking a thing
router.get(
  '/ajax/like/:type/:bigId',
  asyncMiddleware(async (req, res) => {
    let CAN_POST = await userHasReward(req.user, REWARDS.CAN_ADD_FORUM);
    if (!CAN_POST) {
      res.status(200).send('You need 10 games to like a forum/comment.');
      return;
    }

    const [forumId, commentId, replyId] = req.params.bigId.split('=');
    const { type } = req.params;

    let foundComment;
    let foundReply;
    // There should always be a forumId
    const foundThread = await forumThread
      .findById(forumId)
      .populate('comments')
      .exec();
    if (commentId !== 'null') {
      foundComment = await forumThreadComment
        .findById(commentId)
        .populate('replies')
        .exec();
    }
    if (replyId !== 'null') {
      foundReply = await forumThreadCommentReply.findById(replyId).exec();
    }
    const found = {
      forum: foundThread,
      comment: foundComment,
      reply: foundReply,
    }[type];

    if (!found) {
      res.status(200).send('failed');
      return;
    }

    if (!found.whoLikedId) found.whoLikedId = [];

    // person has already liked it, so unlike it and remove their name
    if (found.whoLikedId.includes(req.user.id)) {
      const i = found.whoLikedId.indexOf(req.user.id);
      // remove their id
      found.whoLikedId.splice(i, 1);
      found.likes -= 1;
      res.status(200).send('unliked');
    } else {
      // add a like
      found.whoLikedId.push(req.user.id);
      found.likes += 1;
      res.status(200).send('liked');

      var link = `/forum/show/${forumId}#${found._id}`;

      // create notif to replying target
      createNotification(
        found.author.id,
        `${req.user.username} has liked your ${type}!`,
        link,
        req.user.username,
      );
    }

    if (foundReply) {
      await foundReply.save();
      foundComment.markModified('replies');
    }
    if (foundComment) {
      await foundComment.save();
      foundThread.markModified('comments');
    }
    await foundThread.save();
  }),
);

router.get(
  '/page/:category/:pageNum',
  asyncMiddleware(async (req, res) => {
    // if theres an invalid page num, redirect toLowerCase() page 1
    if (req.params.pageNum < 1) {
      res.redirect(`/forum/page/${req.params.category}/1`);
    }

    // get all forumThreads from DB, then render
    // if user specified num of results per page
    const numOfResultsPerPage = req.params.numOfResultsPerPage || 10;

    // if we have a specified pageNum, then skip a bit
    // -1 because page numbers start at 1
    const skipNumber = req.params.pageNum
      ? (req.params.pageNum - 1) * numOfResultsPerPage
      : 0;

    const allForumThreads = await forumThread
      .find(
        // eslint-disable-next-line prefer-object-spread
        Object.assign(
          {
            $or: [{ disabled: undefined }, { disabled: false }],
          },
          req.params.category === 'my_posts'
            ? { 'author.username': req.user.username }
            : { category: req.params.category },
        ),
      )
      .sort({ timeLastEdit: 'descending' })
      .skip(skipNumber)
      .limit(numOfResultsPerPage)
      .exec();

    allForumThreads.forEach((thread) => {
      thread.timeSinceString = getTimeDiffInString(thread.timeLastEdit);
    });

    res.render('forum/index', {
      allPinnedThreads: [],
      allForumThreads,
      pageNum: req.params.pageNum,
      activeCategory: req.params.category,
    });
  }),
);

// main page that users land on
router.get(
  '/page/:pageNum',
  asyncMiddleware(async (req, res) => {
    // if theres an invalid page num, redirect to page 1
    if (req.params.pageNum < 1) res.redirect('/forum/page/1');

    const numOfResultsPerPage = req.params.numOfResultsPerPage || 10;
    const skipNumber = req.params.pageNum
      ? (req.params.pageNum - 1) * numOfResultsPerPage
      : 0;

    // if they're mod then allow them to see disabled posts.
    const mod = isMod(req.user.username);
    const modSee = { disabled: mod };

    const allForumThreads = await forumThread
      .find({
        $or: [{ disabled: undefined }, { disabled: false }, modSee],
      })
      .sort({ timeLastEdit: 'descending' })
      .skip(skipNumber)
      .limit(numOfResultsPerPage)
      .exec();

    allForumThreads.forEach((thread) => {
      thread.timeSinceString = getTimeDiffInString(thread.timeLastEdit);
    });

    // get all the pinned threads
    const allPinnedThreadIds = await pinnedThread.find({}).exec();
    const allPinnedThreads = [];

    for (let i = 0; i < allPinnedThreadIds.length; i++) {
      const pinned = await forumThread
        .findById(allPinnedThreadIds[i].forumThread.id)
        .exec();
      if (pinned && pinned.timeLastEdit) {
        pinned.timeSinceString = getTimeDiffInString(pinned.timeLastEdit);
        allPinnedThreads.push(pinned);
      }
    }

    res.render('forum/index', {
      allPinnedThreads,
      allForumThreads,
      pageNum: req.params.pageNum,
      activeCategory: req.params.category,
      mod,
    });
  }),
);

router.post(
  '/forumBan',
  isModMiddleware,
  asyncMiddleware(async (req) => {
    let replyId, commentId, forumId;
    if (req.body.idOfReply !== '') {
      replyId = Types.ObjectId(req.body.idOfReply);
    }
    if (req.body.idOfComment !== '') {
      commentId = Types.ObjectId(req.body.idOfComment);
    }
    if (req.body.idOfForum !== '') {
      forumId = Types.ObjectId(req.body.idOfForum);
    }

    const forumBanData = {
      type: req.body.typeofmodaction,
      bannedPlayer: {
        id: req.body.idOfPlayerToBan,
        username: req.body.banPlayerUsername,
      },
      modWhoBanned: {
        id: req.user.id,
        username: req.user.username,
      },
      reason: req.body.reasonofmodaction,
      whenMade: new Date(),
      descriptionByMod: req.body.descriptionByMod,
      idOfReply: replyId,
      idOfComment: commentId,
      idOfForum: forumId,
      elementDeleted: req.body.typeOfForumElement,
    };

    const foundForumThread = await forumThread
      .findById(req.body.idOfForum)
      .populate({ path: 'comments', populate: { path: 'replies' } })
      .exec();

    if (req.body.typeOfForumElement === 'forum') {
      if (foundForumThread.disabled !== true) {
        foundForumThread.disabled = true;
        foundForumThread.save();

        forumBanData.originalContent = foundForumThread.title;

        ForumBan.create(forumBanData);

        createNotification(
          foundForumThread.author.id,
          'Your forum titled "' + foundForumThread.title + '" was removed.',
          '#',
          req.user.username,
        );

        // Create the log
        ModLog.create({
          type: 'forumBan',
          modWhoMade: {
            id: req.user.id,
            username: req.user.username,
            usernameLower: req.user.username.toLowerCase(),
          },
          data: forumBanData,
          dateCreated: new Date(),
        });
      }
      return;
    }

    const comment = await forumThreadComment
      .findById(req.body.idOfComment)
      .populate('replies')
      .exec();
    var reply = null;
    if (req.body.idOfReply) {
      reply = await forumThreadCommentReply.findById(req.body.idOfReply).exec();
    }

    const found = req.body.typeOfForumElement === 'comment' ? comment : reply;

    if (found.disabled !== true) {
      // Send the notification
      const link = `/forum/show/${foundForumThread._id}#${found._id}`;
      createNotification(
        found.author.id,
        'Your comment/reply was removed.',
        link,
        req.user.username,
      );

      forumBanData.originalContent = found.text;

      found.oldText = found.text;
      found.text = '*Deleted*';
      found.disabled = true;

      comment.markModified('replies');
      foundForumThread.markModified('comments');
      if (req.body.idOfReply) {
        await reply.save();
      }
      await comment.save();
      await foundForumThread.save();

      ForumBan.create(forumBanData);
      // Create the log
      ModLog.create({
        type: 'forumBan',
        modWhoMade: {
          id: req.user.id,
          username: req.user.username,
          usernameLower: req.user.username.toLowerCase(),
        },
        data: forumBanData,
        dateCreated: new Date(),
      });
    }
  }),
);

router.post(
  '/pinThread',
  isModMiddleware,
  asyncMiddleware(async (req) => {
    let idOfThread = '';
    Object.keys(req.body).forEach((key) => {
      idOfThread = key;
    });

    const pin = await pinnedThread
      .findOne({ forumThread: { id: Types.ObjectId(idOfThread) } })
      .exec();
    if (pin !== null) {
      await pinnedThread.findByIdAndRemove(pin._id).exec();
    } else {
      const foundForumThread = await forumThread
        .findById(Types.ObjectId(idOfThread))
        .exec();
      if (foundForumThread) {
        pinnedThread.create({ forumThread: { id: foundForumThread.id } });
      }
    }
  }),
);

export default router;
