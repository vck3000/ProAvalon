const { Router } = require('express');
const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const forumThread = require('../../models/forumThread');
const forumThreadComment = require('../../models/forumThreadComment');
const forumThreadCommentReply = require('../../models/forumThreadCommentReply');

const { checkForumThreadCommentReplyOwnership, asyncMiddleware } = require('../middleware');
const createNotificationObj = require('../../myFunctions/createNotification');
const REWARDS = require("../../rewards/constants");
const { userHasReward } = require("../../rewards/getRewards");

const router = new Router();

const sanitizeHtmlAllowedTagsForumThread = ['img', 'iframe', 'h1', 'h2', 'u', 'span', 'br'];
const sanitizeHtmlAllowedAttributesForumThread = {
    a: ['href', 'name', 'target'],
    img: ['src', 'style'],
    iframe: ['src', 'style'],
    // '*': ['style'],
    table: ['class'],

    p: ['style'],

    span: ['style'],
    b: ['style'],
};

const newReplyLimiter = process.env.MY_PLATFORM === 'local'
    ? rateLimit({
        max: 0, // Disable if we are local
    })
    : rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hours
        max: 10,
    });

/** ******************************************************* */
// Create a new comment reply route
/** ******************************************************* */
router.post('/:id/:commentId', newReplyLimiter, (req, res) => {
    createCommentReply(req, res);
});
router.post('/:id/:commentId/:replyId', newReplyLimiter, (req, res) => {
    createCommentReply(req, res);
});

async function createCommentReply(req, res) {
    let CAN_POST = await userHasReward(req.user, REWARDS.CAN_ADD_FORUM, undefined);
    if (!CAN_POST) {
        req.flash('error', 'You need 10 games to reply to a comment.');
        res.redirect('back');
        return;
    }

    const d = new Date();

    const commentReplyData = {
        text: sanitizeHtml(req.body.comment.text, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
            allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
        }),

        author: { id: req.user._id, username: req.user.username },

        timeCreated: d,
        timeLastEdit: d,

        likes: 0,
    };

    if (req.params.replyId) {
        forumThreadCommentReply.findById(mongoose.Types.ObjectId(req.params.replyId)).exec((err, foundReply) => {
            // If there was someone who this reply was targeted to
            commentReplyData.replyingUsername = foundReply.author.username;
            createReply(req, res, commentReplyData, foundReply);
        });
    } else {
        createReply(req, res, commentReplyData);
    }
}

async function createReply(req, res, commentReplyData, replyingToThisReply) {
    // the creator has already seen it
    commentReplyData.seenUsers = [req.user.username.toLowerCase()];
    const newCommentReply = await forumThreadCommentReply.create(commentReplyData);
    const foundForum = await forumThread.findById(mongoose.Types.ObjectId(req.params.id)).exec();
    if (!foundForum) {
        req.flash('error', 'There was an error creating your reply. Please let the admin know.');
        res.redirect(`/forum/show/${req.params.id}`);
        return;
    }

    const foundForumThreadComment = await forumThreadComment.findById(req.params.commentId).populate('replies').exec();
    if (!foundForumThreadComment) {
        req.flash('error', 'There was an error creating your reply. Please let the admin know.');
        res.redirect(`/forum/show/${req.params.id}`);
        return;
    }

    if (!foundForumThreadComment.replies) {
        foundForumThreadComment.replies = [];
    }

    foundForumThreadComment.replies.push(newCommentReply);
    foundForumThreadComment.save();

    const notify = (id, type) => {
        createNotificationObj.createNotification(
            mongoose.Types.ObjectId(id),
            `${req.user.username} has replied to your ${type}.`,
            `/forum/show/${foundForum._id}#${newCommentReply._id}`,
            req.user.username,
        );
    };

    const mainAuthorId = foundForumThreadComment.author.id;
    if (replyingToThisReply) {
        // create notif to replying target
        notify(replyingToThisReply.author.id, 'reply');
    }
    if (mainAuthorId
        && !(replyingToThisReply && replyingToThisReply.author.id.equals(mainAuthorId))) {
        // create notif to main comment person
        notify(mainAuthorId, 'comment');
    }

    const foundForumThread = await forumThread.findById(req.params.id).populate('comments').exec();
    foundForumThread.markModified('comments');
    // add 1 to the num of comments
    foundForumThread.numOfComments += 1;

    // update time last edited
    foundForumThread.timeLastEdit = new Date();
    foundForumThread.whoLastEdit = req.user.username;

    await foundForumThread.save();

    // since there is a new comment, the thread is now refreshed and no one has seen the new
    // changes yet, except for the one who made the comment
    foundForum.seenUsers = [req.user.username.toLowerCase()];
    foundForum.markModified("seenUsers");
    foundForum.save().catch(err => {
        console.log(err);
    });

    // redirect to same forum thread
    res.redirect(`/forum/show/${req.params.id}`);
}

router.get('/:id/:comment_id/:reply_id/edit', checkForumThreadCommentReplyOwnership, asyncMiddleware(async (req, res) => {
    const foundReply = await forumThreadCommentReply.findById(req.params.reply_id).exec();
    if (foundReply.disabled) {
        req.flash('error', 'You cannot edit a deleted reply.');
        res.redirect('back');
    } else {
        res.render('forum/comment/reply/edit', {
            reply: foundReply,
            comment: { id: req.params.comment_id },
            forumThread: { id: req.params.id },
        });
    }
}));

/** ******************************************************* */
// Update a comment reply route
/** ******************************************************* */
router.put('/:id/:comment_id/:reply_id', checkForumThreadCommentReplyOwnership, asyncMiddleware(async (req, res) => {
    const foundReply = await forumThreadCommentReply.findById(req.params.reply_id).exec();
    if (foundReply.disabled) {
        req.flash('error', 'You cannot edit a deleted reply.');
        res.redirect('back');
        return;
    }
    foundReply.text = sanitizeHtml(req.body.reply.text, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
        allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
    });
    foundReply.edited = true;
    foundReply.timeLastEdit = new Date();
    await foundReply.save();

    // forumThread.findById(req.params.id)
    const foundForumThreadComment = await forumThreadComment.findById(req.params.comment_id).populate('replies').exec();
    foundForumThreadComment.markModified('replies');
    // update time last edited
    foundForumThreadComment.timeLastEdit = new Date();
    await foundForumThreadComment.save();

    // forumThread.findById(req.params.id)
    const foundForumThread = await forumThread.findById(req.params.id).populate('comments').exec();
    foundForumThread.markModified('comments');
    foundForumThread.whoLastEdit = req.user.username;
    // update time last edited
    foundForumThread.timeLastEdit = new Date();
    await foundForumThread.save();

    // redirect to the forum page
    res.redirect(`/forum/show/${req.params.id}`);
}));


/** ******************************************************* */
// Destroy a comment reply route
/** ******************************************************* */
router.delete('/deleteCommentReply/:id/:comment_id/:reply_id', checkForumThreadCommentReplyOwnership, asyncMiddleware(async (req, res) => {
    const foundReply = await forumThreadCommentReply.findById(req.params.reply_id).exec();
    if (foundReply.disabled) {
        req.flash('error', 'You cannot delete a deleted reply.');
        res.redirect('back');
        return;
    }
    foundReply.disabled = true;
    foundReply.oldText = foundReply.text;
    foundReply.text = '*Deleted*';
    await foundReply.save();

    const foundComment = await forumThreadComment.findById(req.params.comment_id).populate('replies').exec();
    foundComment.markModified('replies');
    await foundComment.save();

    const foundForumThread = await forumThread.findById(req.params.id).populate('comments').exec();
    foundForumThread.markModified('comments');
    await foundForumThread.save();
    res.redirect(`/forum/${req.params.id}`);
}));

module.exports = router;
