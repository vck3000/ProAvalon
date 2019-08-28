const { Router } = require('express');

const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const forumThread = require('../../models/forumThread');
const forumThreadComment = require('../../models/forumThreadComment');
const middleware = require('../../middleware');
const User = require('../../models/user');

const createNotificationObj = require('../../myFunctions/createNotification');

const router = new Router();

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


const newCommentLimiter = process.env.MY_PLATFORM === 'local'
    ? rateLimit({
        max: 0, // Disable if we are local
    })
    : rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hours
        max: 15,
    });
/** ******************************************************* */
// Create new comment route
/** ******************************************************* */
router.post('/:id/comment', newCommentLimiter, async (req, res) => {
    const commentData = {

        text: sanitizeHtml(req.body.comment.text, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
            allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
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

    forumThreadComment.create(commentData, (err, newComment) => {
        // console.log("new comment: " + newComment);
        // console.log("Thread id: " + req.params.id);
        // console.log("Redirecting to: " + "/forum/show/" + req.params.id);

        forumThread.findById(mongoose.Types.ObjectId(req.params.id)).populate('comments').exec((err, foundForumThread) => {
            // console.log("title of thread found: " + foundForumThread.title);
            // console.log("current comments: " + foundForumThread.comments);
            foundForumThread.comments.push(newComment);
            // console.log("current comments after add: " + foundForumThread.comments);

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
                const link = (`/forum/show/${foundForumThread._id}#${newComment._id}`);

                createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);
            }


            // redirect to same forum thread
            res.redirect(`/forum/show/${req.params.id}`);

            // since there is a new comment, the thread is now refreshed and no one has seen the new changes yet,
            // except for the one who made the comment
            foundForumThread.seenUsers = [req.user.username.toLowerCase()];
            foundForumThread.save();
        });
    });
});


/** ******************************************************* */
// Show the edit a comment page
/** ******************************************************* */
router.get('/:id/:comment_id/edit', middleware.checkForumThreadCommentOwnership, (req, res) => {
    forumThreadComment.findById(req.params.comment_id, async (err, foundComment) => {
        if (err) {
            console.log(`ERROR: ${err}`);
        }
        if (foundComment.disabled === true) {
            req.flash('error', 'Comment has been deleted.');
            res.redirect('back');
        } else {
            let userNotifications = [];

            await User.findById(req.user._id).populate('notifications').exec((err, foundUser) => {
                if (!err) { userNotifications = foundUser.userNotifications; }
            });
            res.render('forum/comment/edit', { comment: foundComment, forumThread: { id: req.params.id }, userNotifications });
        }
    });
});


/** ******************************************************* */
// Update a comment route
/** ******************************************************* */
router.put('/:id/:comment_id', middleware.checkForumThreadCommentOwnership, (req, res) => {
    // find and update the correct campground

    forumThreadComment.findById(req.params.comment_id, async (err, foundComment) => {
        if (err) {
            res.redirect('/forum');
        } else {
            console.log('AAA');
            console.log(foundComment.disabled);

            if (foundComment.disabled === true) {
                req.flash('error', 'You cannot edit a deleted comment.');
                // make them refresh to see the req.flash;
                res.redirect('back');
            } else {
                foundComment.text = sanitizeHtml(req.body.comment.text, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
                    allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
                }),


                foundComment.edited = true;
                foundComment.timeLastEdit = new Date();

                await foundComment.save();

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
            }
        }
    });
});


/** ******************************************************* */
// Destroy a comment route
/** ******************************************************* */
router.delete('/deleteComment/:id/:comment_id', middleware.checkForumThreadCommentOwnership, (req, res) => {
    console.log('Reached delete comment route');
    forumThreadComment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
            res.redirect('/forum');
        } else {
            console.log('Deleted (disabled) a comment by author.');
            console.log(`thread id ${req.params.id}`);

            foundComment.disabled = true;
            foundComment.oldText = foundComment.text;
            foundComment.text = '*Deleted*';


            foundComment.save(() => {
                forumThread.findById(req.params.id).populate('comments').exec(async (err, foundForumThread) => {
                    foundForumThread.markModified('comments');
                    await foundForumThread.save();
                });

                res.redirect(`/forum/${req.params.id}`);
            });
        }
    });
});

module.exports = router;
