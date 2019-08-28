const { Router } = require('express');
const sanitizeHtml = require('sanitize-html');
const rateLimit = require('express-rate-limit');

const middleware = require('../../middleware');
const getTimeDiffInString = require('../../assets/myLibraries/getTimeDiffInString');

const lastIds = require('../../models/lastIds');
const User = require('../../models/user');
const forumThread = require('../../models/forumThread');

const modsArray = require('../../modsadmins/mods');

// Prevent too many requests
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


/** ******************************************************* */
// Show the forumThread
/** ******************************************************* */
router.get('/show/:id', (req, res) => {
    forumThread.findById(req.params.id)
    // .populate("comments")
    // .populate({ path: "comments", populate: { path: "replies" } })
        .populate({ path: 'comments', populate: { path: 'replies' } })
        .exec(async (err, foundForumThread) => {
            if (err) {
                // console.log(err);
                console.log('Thread not found, redirecting');
                res.redirect('/forum');
            } else {
                if (foundForumThread === null) {
                    console.log('Thread not found, redirecting');
                    res.redirect('/forum');
                    return;
                }

                // update the time since string for forumThread
                const timeSince = getTimeDiffInString(foundForumThread.timeLastEdit);
                foundForumThread.timeSinceString = timeSince;

                // update the time since string for each comment
                foundForumThread.comments.forEach((comment) => {
                    comment.timeSinceString = getTimeDiffInString(comment.timeLastEdit);

                    // update the time since string for each reply to a comment
                    comment.replies.forEach((reply) => {
                        reply.timeSinceString = getTimeDiffInString(reply.timeLastEdit);
                        // console.log("client: ");
                        // console.log(reply.clients);
                    });

                    // console.log(comment.replies);
                });

                const userIdString = req.user._id.toString().replace(' ', '');

                const idsOfLikedPosts = [];
                // have they liked the main post already?
                if (foundForumThread.whoLikedId) {
                    for (let i = 0; i < foundForumThread.whoLikedId.length; i++) {
                        if (foundForumThread.whoLikedId[i] && foundForumThread.whoLikedId[i].toString().replace(' ', '') === userIdString) {
                            idsOfLikedPosts[0] = foundForumThread._id;
                            console.log('added');
                            break;
                        }
                    }
                }

                // console.log("liked: ");
                // console.log(typeof(foundForumThread.whoLikedId[0].toString()));
                // console.log(typeof(userIdString));
                // console.log(foundForumThread.whoLikedId[0].toString === userIdString);


                foundForumThread.comments.forEach((comment) => {
                    if (comment.whoLikedId) {
                        for (let i = 0; i < comment.whoLikedId.length; i++) {
                            if (comment.whoLikedId[i] && comment.whoLikedId[i].toString().replace(' ', '') === userIdString) {
                                idsOfLikedPosts.push(comment._id);
                            }
                        }
                    }

                    comment.replies.forEach((reply) => {
                        if (reply.whoLikedId) {
                            for (let i = 0; i < reply.whoLikedId.length; i++) {
                                if (reply.whoLikedId[i] && reply.whoLikedId[i].toString().replace(' ', '') === userIdString) {
                                    idsOfLikedPosts.push(reply._id);
                                }
                            }
                        }
                    });
                });

                let userNotifications = [];

                const foundUser = await User.findOne({ username: req.user.username }).populate('notifications').exec();
            
                if (foundUser.notifications) {
                    userNotifications = foundUser.notifications;
                }

                const isMod = modsArray.includes(req.user.username.toLowerCase());

                // if the forumthread is disabled and  the person is not a mod, then don't show
                if (foundForumThread.disabled && !isMod) {
                    req.flash('error', 'Thread has been deleted.');
                    res.redirect('/forum/page/1');
                } else {
                    res.render('forum/show', {
                        userNotifications,
                        forumThread: foundForumThread,
                        currentUser: req.user,
                        idsOfLikedPosts,
                        mod: isMod,
                    });

                    // Below is seen/unseen code

                    // if there is no seen users array, create it and add the user
                    if (!foundForumThread.seenUsers) {
                        foundForumThread.seenUsers = [];
                    }
                    // if the viewing user isnt on the list, then add them.
                    if (foundForumThread.seenUsers.indexOf(req.user.username.toLowerCase()) === -1) {
                        foundForumThread.seenUsers.push(req.user.username.toLowerCase());
                    }

                    // for every comment, add the user to seen users
                    foundForumThread.comments.forEach(async (comm) => {
                        let changesMade = false;

                        // see all the comments
                        if (!comm.seenUsers) { comm.seenUsers = []; }
                        // if the user isnt on the list, add them. otherwise no need.
                        if (comm.seenUsers.indexOf(req.user.username.toLowerCase()) === -1) {
                            comm.seenUsers.push(req.user.username.toLowerCase());
                            changesMade = true;
                        }
                        // see all the replies
                        comm.replies.forEach(async (rep) => {
                            if (!rep.seenUsers) { rep.seenUsers = []; }
                            // if the user isnt on the list, add them. otherwise no need.
                            if (rep.seenUsers.indexOf(req.user.username.toLowerCase()) === -1) {
                                rep.seenUsers.push(req.user.username.toLowerCase());
                                changesMade = true;
                                await rep.save();
                            }
                        });

                        // only need to comm.save() if there was a change.
                        // otherwise save some resources and skip saving.
                        if (changesMade === true) {
                            comm.markModified('replies');
                            await comm.save();
                        }
                    });
                    // there is always at least one change, so just save.
                    foundForumThread.markModified('comments');
                    foundForumThread.save();
                }
            }
        });
});

/** ******************************************************* */
// Show the create new forumThread page
/** ******************************************************* */
router.get('/new', (req, res) => {
    res.render('forum/new');
});


// if this is the first.
lastIds.findOne({}).exec(async (err, returnedLastId) => {
    if (!returnedLastId) {
        await lastIds.create({ number: 1 });
    }
});


const newForumLimiter = process.env.MY_PLATFORM === 'local'
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
router.post('/', newForumLimiter, async (req, res) => {
    const util = require('util');

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
    let number = 0;
    await lastIds.findOne({}).exec(async (err, returnedLastId) => {
        if (!returnedLastId) {
            await lastIds.create({ number: 1 });
        }

        number = returnedLastId.number;
        returnedLastId.number++;
        await returnedLastId.save();

        const newForumThread = {
            title: sanitizeHtml(req.body.title),
            description: sanitizeHtml(req.body.description, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
                allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
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
        forumThread.create(newForumThread, (err, newlyCreated) => {
            if (err) {
                console.log(err);
            } else {
                // redirect back to campgrounds page
                res.redirect('/forum');
            }
        });
    });
});


/** ******************************************************* */
// Show the edit forumThread route
/** ******************************************************* */
router.get('/:id/edit', middleware.checkForumThreadOwnership, (req, res) => {
    forumThread.findById(req.params.id, async (err, foundForumThread) => {
        if (foundForumThread.disabled === true) {
            req.flash('error', 'You cannot edit a deleted forum thread.');
            res.redirect('back');
        } else {
            let userNotifications = [];

            await User.findOne({ username: req.user.username }).populate('notifications').exec((err, foundUser) => {
                if (foundUser.notifications && foundUser.notifications !== null || foundUser.notifications !== undefined) {
                    userNotifications = foundUser.notifications;
                    console.log(foundUser.notifications);
                }

                res.render('forum/edit', { forumThread: foundForumThread, currentUser: req.user, userNotifications });
            });
        }
    });
});

/** ******************************************************* */
// Update the forumThread route
/** ******************************************************* */
router.put('/:id', middleware.checkForumThreadOwnership, (req, res) => {
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

    forumThread.findById(req.params.id, (err, foundForumThread) => {
        if (err) {
            req.flash('error', 'There was an error finding your forum thread.');
            res.redirect('/forum');
        } else if (foundForumThread.disabled === true) {
            req.flash('error', 'You cannot edit a deleted forum thread.');
            res.redirect('back');
        } else {
            if (categoryChange === true) {
                // update the category
                foundForumThread.category = category;
            }

            // add the required changes for an edit
            foundForumThread.edited = true;
            foundForumThread.timeLastEdit = new Date();
            foundForumThread.whoLastEdit = req.user.username;

            // sanitize the description once again
            foundForumThread.description = sanitizeHtml(req.body.forumThread.description, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
                allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
            });

            foundForumThread.title = sanitizeHtml(req.body.forumThread.title);

            foundForumThread.save();

            res.redirect(`/forum/show/${foundForumThread.id}`);
        }
    });
});


/** ******************************************************* */
// Destroy the forumThread route
/** ******************************************************* */
router.delete('/deleteForumThread/:id', middleware.checkForumThreadOwnership, (req, res) => {
    forumThread.findById(req.params.id, (err, foundForumThread) => {
        if (err) {
            res.redirect('/forum');
        } else {
            console.log('Deleted (disabled) a forumThread by the author.');

            foundForumThread.disabled = true;
            foundForumThread.save();

            res.redirect('/forum');
        }
    });
});


module.exports = router;
