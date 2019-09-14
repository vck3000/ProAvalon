const express = require('express');

const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const forumThread = require('../../models/forumThread');
const forumThreadComment = require('../../models/forumThreadComment');
const forumThreadCommentReply = require('../../models/forumThreadCommentReply');
const lastIds = require('../../models/lastIds');
const middleware = require('../../middleware');
const getTimeDiffInString = require('../../assets/myLibraries/getTimeDiffInString');
const User = require('../../models/user');
const createNotificationObj = require('../../myFunctions/createNotification');


// Prevent too many requests

// var sanitizeHtmlAllowedTagsForumThread = ['u'];
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
        max: 15,
    });
/** ******************************************************* */
// Create a new comment reply route
/** ******************************************************* */
router.post('/:id/:commentId', newReplyLimiter, middleware.isLoggedIn, async (req, res) => {
    createCommentReply(req, res);
});
router.post('/:id/:commentId/:replyId', newReplyLimiter, middleware.isLoggedIn, async (req, res) => {
    createCommentReply(req, res);
});

function createCommentReply(req, res) {
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
        // commentReplyData.clients = [req.params.replyId];
        // console.log("Got replyId");
        const id = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');

        forumThreadCommentReply.findById(mongoose.Types.ObjectId(req.params.replyId)).exec((err, foundReply) => {
            // If there was someone who this reply was targetted to
            commentReplyData.replyingUsername = foundReply.author.username;

            createReply(req, res, commentReplyData, foundReply);
        });
    } else {
        createReply(req, res, commentReplyData);
    }
}


function createReply(req, res, commentReplyData, replyingToThisReply) {
    // the creator has already seen it
    commentReplyData.seenUsers = [req.user.username.toLowerCase()];

    forumThreadCommentReply.create(commentReplyData, (err, newCommentReply) => {
        if (err) {
            console.log(err);
            req.flash('error', 'There was an error creating your reply code 1. Please let the admin know.');
            res.redirect(`/forum/show/${req.params.id}`);
            return;
        }
        // console.log("new commentReply: " + newCommentReply);
        forumThread.findById(mongoose.Types.ObjectId(req.params.id), (err, foundForum) => {
            if (err) {
                console.log(err);
                req.flash('error', 'There was an error creating your reply code 2. Please let the admin know.');
                res.redirect(`/forum/show/${req.params.id}`);
            } else if (foundForum !== undefined || foundForum !== null) {
                forumThreadComment.findById(req.params.commentId).populate('replies').exec((err, foundForumThreadComment) => {
                    if (foundForumThreadComment !== undefined || foundForumThreadComment !== null) {
                        if (foundForumThreadComment.replies === undefined) {
                            foundForumThreadComment.replies = [];
                        }

                        foundForumThreadComment.replies.push(newCommentReply);
                        foundForumThreadComment.save();

                        if (replyingToThisReply) {
                            // create notif to replying target
                            var userIdTarget = mongoose.Types.ObjectId(replyingToThisReply.author.id);
                            var stringToSay = `${req.user.username} has replied to your reply.`;
                            // console.log(foundForum);
                            // console.log("**************");
                            // console.log("**************");
                            // console.log("**************");
                            // console.log(newCommentReply);
                            var link = (`/forum/show/${foundForum._id}#${newCommentReply._id}`);

                            createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);

                            // console.log("**********************************");
                            // console.log(replyingToThisReply.author.id);
                            // console.log(foundForumThreadComment.author.id);
                            // console.log(replyingToThisReply.author.id.equals(foundForumThreadComment.author.id));

                            if (foundForumThreadComment.author.id && replyingToThisReply.author.id.equals(foundForumThreadComment.author.id)) {
                                // dont create two notifications for a player
                            } else if (foundForumThreadComment.author.id) {
                                // create notif to main comment person
                                var userIdTarget = mongoose.Types.ObjectId(foundForumThreadComment.author.id);
                                var stringToSay = `${req.user.username} has replied to your comment.`;
                                var link = (`/forum/show/${foundForum._id}#${newCommentReply._id}`);

                                createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);
                            }
                        } else if (foundForumThreadComment.author.id) {
                            // create notif to main comment person
                            var userIdTarget = mongoose.Types.ObjectId(foundForumThreadComment.author.id);
                            var stringToSay = `${req.user.username} has replied to your comment.`;
                            var link = (`/forum/show/${foundForum._id}#${newCommentReply._id}`);

                            createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);
                        }

                        // console.log(foundForumThreadComment);
                        // console.log("author");
                        // console.log(foundForumThreadComment.author);

                        forumThread.findById(req.params.id).populate('comments').exec((err, foundForumThread) => {
                            foundForumThread.markModified('comments');
                            // add 1 to the num of comments
                            foundForumThread.numOfComments += 1;

                            // update time last edited
                            foundForumThread.timeLastEdit = new Date();
                            foundForumThread.whoLastEdit = req.user.username;


                            foundForumThread.save();
                        });
                    }
                    // redirect to same forum thread
                    res.redirect(`/forum/show/${req.params.id}`);
                });
                // since there is a new comment, the thread is now refreshed and no one has seen the new changes yet,
                // except for the one who made the comment
                foundForum.seenUsers = [req.user.username.toLowerCase()];
                foundForum.save();
            } else {
                console.log(err);
                req.flash('error', 'There was an error creating your reply. Please let the admin know.');
                res.redirect(`/forum/show/${req.params.id}`);
            }
        });
    });
}
/** ******************************************************* */
// Edit a comment reply
/** ******************************************************* */
router.get('/:id/:comment_id/:reply_id/edit', middleware.checkForumThreadCommentReplyOwnership, (req, res) => {
    forumThreadCommentReply.findById(req.params.reply_id, async (err, foundReply) => {
        if (err) {
            console.log(`ERROR: ${err}`);
        } else if (foundReply.disabled === true) {
            req.flash('error', 'You cannot edit a deleted reply.');
            res.redirect('back');
        } else {
            let userNotifications = [];

            await User.findById(req.user._id).populate('notifications').exec((err, foundUser) => {
                if (!err) { userNotifications = foundUser.userNotifications; }
            });

            res.render('forum/comment/reply/edit', {
                reply: foundReply, comment: { id: req.params.comment_id }, forumThread: { id: req.params.id }, userNotifications,
            });
        }
    });
});

/** ******************************************************* */
// Update a comment reply route
/** ******************************************************* */
router.put('/:id/:comment_id/:reply_id', middleware.checkForumThreadCommentReplyOwnership, (req, res) => {
    console.log('Edit a reply');

    forumThreadCommentReply.findById(req.params.reply_id, async (err, foundReply) => {
        if (err) {
            res.redirect('/forum');
        } else if (foundReply.disabled === true) {
            req.flash('error', 'You cannot edit a deleted reply.');
            res.redirect('back');
        } else {
            foundReply.text = sanitizeHtml(req.body.reply.text, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
                allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
            });
            foundReply.edited = true;
            foundReply.timeLastEdit = new Date();
            await foundReply.save();

            // forumThread.findById(req.params.id)
            forumThreadComment.findById(req.params.comment_id).populate('replies').exec(async (err, foundForumThreadComment) => {
                foundForumThreadComment.markModified('replies');
                // update time last edited
                foundForumThreadComment.timeLastEdit = new Date();


                await foundForumThreadComment.save();

                // forumThread.findById(req.params.id)
                forumThread.findById(req.params.id).populate('comments').exec(async (err, foundForumThread) => {
                    console.log('found forum thread:');
                    console.log(req.params.id);

                    foundForumThread.markModified('comments');
                    // update time last edited
                    foundForumThread.timeLastEdit = new Date();
                    foundForumThread.whoLastEdit = req.user.username;
                    await foundForumThread.save();

                    // redirect to the forum page
                    // req.flash("success", "Comment updated successfully.");
                    res.redirect(`/forum/show/${req.params.id}`);
                });
            });
        }
    });
});


/** ******************************************************* */
// Destroy a comment reply route
/** ******************************************************* */
router.delete('/deleteCommentReply/:id/:comment_id/:reply_id', middleware.checkForumThreadCommentReplyOwnership, (req, res) => {
    console.log('Reached delete comment reply route');
    console.log(`forum id: ${req.params.id}`);
    console.log(`comment id: ${req.params.comment_id}`);
    console.log(`reply id: ${req.params.reply_id}`);
    console.log(' ');


    forumThreadCommentReply.findById(req.params.reply_id, (err, foundReply) => {
        if (err) {
            res.redirect('/forum');
        } else {
            console.log('Deleted (disabled) a reply by author.');

            foundReply.disabled = true;
            foundReply.oldText = foundReply.text;
            foundReply.text = '*Deleted*';


            foundReply.save(() => {
                forumThreadComment.findById(req.params.comment_id).populate('replies').exec(async (err, foundComment) => {
                    if (err) {
                        console.log(err);
                    } else {
                        foundComment.markModified('replies');
                        await foundComment.save();

                        // console.log("A");


                        forumThread.findById(req.params.id).populate('comments').exec(async (err, foundForumThread) => {
                            if (err) {
                                console.log(err);
                            } else {
                                foundForumThread.markModified('comments');
                                await foundForumThread.save();
                                // console.log("B");
                            }
                        });
                    }
                });
                res.redirect(`/forum/${req.params.id}`);
            });
        }
    });
});

module.exports = router;
