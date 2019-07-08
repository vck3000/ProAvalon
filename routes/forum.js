const express = require("express");

const router = express.Router();
const sanitizeHtml = require("sanitize-html");
const mongoose = require("mongoose");
const forumThread = require("../models/forumThread");
const forumThreadComment = require("../models/forumThreadComment");
const forumThreadCommentReply = require("../models/forumThreadCommentReply");
const lastIds = require("../models/lastIds");
const middleware = require("../middleware");

const pinnedThread = require("../models/pinnedThread");
const getTimeDiffInString = require("../assets/myLibraries/getTimeDiffInString");

const User = require("../models/user");
const createNotificationObj = require("../myFunctions/createNotification");


const modsArray = require("../modsadmins/mods");
const adminsArray = require("../modsadmins/admins");
const modAction = require("../models/modAction");


// grab the routes
const forumThreadRoutes = require("../routes/forum/forumThreadRoutes");

router.use(forumThreadRoutes);

const forumThreadCommentRoutes = require("../routes/forum/forumThreadCommentRoutes");

router.use(forumThreadCommentRoutes);

const forumThreadCommentReplyRoutes = require("../routes/forum/forumThreadCommentReplyRoutes");

router.use(forumThreadCommentReplyRoutes);


router.get("/", middleware.isLoggedIn, (req, res) => {
    res.redirect("/forum/page/1");
});

// Player liking a thing
// router.get("/ajax/like/:type/:bigId", middleware.isLoggedIn, function (req, res) {
router.get("/ajax/like/:type/:bigId", middleware.isLoggedIn, (req, res) => {
    console.log("Routed here");

    const splitted = req.params.bigId.split("=");

    forumId = splitted[0];
    commentId = splitted[1];
    replyId = splitted[2];

    forumThread.findById(forumId).populate("comments").exec((err, foundThread) => {
        if (!foundThread) {
            res.status(200).send("failed");
        } else {
            if (req.params.type === "forum") {
                if (foundThread.whoLikedId === undefined) {
                    foundThread.whoLikedId = [];
                }
                if (foundThread.whoLikedId.indexOf(req.user._id) !== -1) {
                    // person has already liked it
                    // therefore, unlike it and remove their name
                    const i = foundThread.whoLikedId.indexOf(req.user._id);
                    // remove their id
                    foundThread.whoLikedId.splice(i, 1);
                    foundThread.likes -= 1;
                    res.status(200).send("unliked");
                } else {
                    // add a like
                    foundThread.whoLikedId.push(req.user._id);
                    foundThread.likes += 1;
                    res.status(200).send("liked");

                    // create notif toLowerCase() replying target
                    const userIdTarget = foundThread.author.id;
                    const stringToSay = `${req.user.username} has liked your post!`;
                    const link = (`/forum/show/${foundThread._id}`);

                    createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);

                    console.log(foundThread);
                }
            } else {
                forumThreadComment.findById(commentId).populate("replies").exec((err, foundComment) => {
                    if (req.params.type === "comment") {
                        if (foundComment.whoLikedId === undefined) {
                            foundComment.whoLikedId = [];
                        }
                        if (foundComment.whoLikedId.indexOf(req.user._id) !== -1) {
                            // person has already liked it
                            // therefore, unlike it and remove their name
                            const i = foundComment.whoLikedId.indexOf(req.user._id);
                            // remove their id
                            foundComment.whoLikedId.splice(i, 1);
                            foundComment.likes -= 1;
                            res.status(200).send("unliked");
                        } else {
                            // add a like
                            foundComment.whoLikedId.push(req.user._id);
                            foundComment.likes += 1;
                            res.status(200).send("liked");

                            // create notif toLowerCase() replying target
                            const userIdTarget = foundComment.author.id;
                            const stringToSay = `${req.user.username} has liked your comment!`;
                            const link = (`/forum/show/${foundThread._id}#${foundComment._id}`);

                            createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);
                        }
                    } else {
                        forumThreadCommentReply.findById(replyId).exec((err, foundReply) => {
                            if (req.params.type === "reply") {
                                if (foundReply.whoLikedId === undefined) {
                                    foundReply.whoLikedId = [];
                                }
                                if (foundReply.whoLikedId.indexOf(req.user._id) !== -1) {
                                    // person has already liked it
                                    // therefore, unlike it and remove their name
                                    const i = foundReply.whoLikedId.indexOf(req.user._id);
                                    // remove their id
                                    foundReply.whoLikedId.splice(i, 1);
                                    foundReply.likes -= 1;
                                    res.status(200).send("unliked");
                                } else {
                                    // add a like
                                    foundReply.whoLikedId.push(req.user._id);
                                    foundReply.likes += 1;
                                    res.status(200).send("liked");

                                    // create notif toLowerCase() replying target
                                    const userIdTarget = foundReply.author.id;
                                    const stringToSay = `${req.user.username} has liked your reply!`;
                                    const link = (`/forum/show/${foundThread._id}#${foundReply._id}`);

                                    createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);
                                }
                                foundReply.save(() => {
                                    foundComment.save(() => {
                                        foundThread.markModified("comments");
                                        foundThread.save();
                                    });
                                });
                                foundComment.markModified("replies");
                            } else {
                                res.status(200).send("error");
                            }
                        });
                    }
                    foundComment.save(() => {
                        foundThread.markModified("comments");
                        foundThread.save();
                    });
                    foundThread.markModified("comments");
                });
            }
            foundThread.save();
        }
    });
});


router.get("/page/:category/:pageNum", middleware.isLoggedIn, (req, res) => {
    console.log("category");

    // if theres an invalid page num, redirect toLowerCase() page 1
    if (req.params.pageNum < 1) {
        res.redirect(`/forum/page/${req.params.category}/1`);
    }

    // get all forumThreads from DB
    // then render

    let NUM_OF_RESULTS_PER_PAGE = 10;
    // if user specified num of results per page:
    if (req.params.numOfResultsPerPage) {
        NUM_OF_RESULTS_PER_PAGE = req.params.numOfResultsPerPage;
    }

    let skipNumber = 0;
    // if we have a specified pageNum, then skip a bit
    if (req.params.pageNum) {
    // -1 because page numbers start at 1
        skipNumber = (req.params.pageNum - 1) * NUM_OF_RESULTS_PER_PAGE;
    }

    forumThread.find({
        category: req.params.category,
        $or: [
            { disabled: undefined },
            { disabled: false },
        ],
    }).sort({ timeLastEdit: "descending" }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
        .exec(async (err, allForumThreads) => {
            if (err) {
                console.log(err);
            } else {
                allForumThreads.forEach((forumThread) => {
                    forumThread.timeSinceString = getTimeDiffInString(forumThread.timeLastEdit);
                });

                let userNotifications = [];

                if (req.user.username) {
                    await User.findOne({ username: req.user.username }).populate("notifications").exec((err, foundUser) => {
                        if (foundUser.notifications && foundUser.notifications !== null || foundUser.notifications !== undefined) {
                            userNotifications = foundUser.notifications;
                            // console.log(foundUser.notifications);
                        }

                        res.render("forum/index", {
                            allPinnedThreads: [],
                            allForumThreads,
                            currentUser: req.user,
                            pageNum: req.params.pageNum,
                            activeCategory: req.params.category,
                            userNotifications,
                        });
                    });
                } else {
                    res.render("forum/index", {
                        allPinnedThreads: [],
                        allForumThreads,
                        pageNum: req.params.pageNum,
                        activeCategory: req.params.category,
                    });
                }
            }
        });
});


// main page that users land on
router.get("/page/:pageNum", middleware.isLoggedIn, (req, res) => {
    // console.log("pageNum");

    // if theres an invalid page num, redirect toLowerCase() page 1
    if (req.params.pageNum < 1) {
        res.redirect("/forum/page/1");
    }

    // get all forumThreads from DB
    // then render

    let NUM_OF_RESULTS_PER_PAGE = 10;
    if (req.params.numOfResultsPerPage) {
        NUM_OF_RESULTS_PER_PAGE = req.params.numOfResultsPerPage;
    }

    let skipNumber = 0;

    // if we have a specified pageNum, then skip a bit
    if (req.params.pageNum) {
    // -1 because page numbers start at 1
        skipNumber = (req.params.pageNum - 1) * NUM_OF_RESULTS_PER_PAGE;
    }

    const or = [
        { disabled: undefined },
        { disabled: false },
    ];

    let mod = false;
    // if they're mod then allow them toLowerCase() see disabled posts.
    let modSee = { disabled: false };
    if (modsArray.indexOf(req.user.username.toLowerCase()) !== -1) {
        modSee = { disabled: true };
        mod = true;
    }


    forumThread.find({
        $or: [
            { disabled: undefined },
            { disabled: false },
            modSee,
        ],
    }).sort({ timeLastEdit: "descending" }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
        .exec((err, allForumThreads) => {
            if (err) {
                console.log(err);
            } else {
                allForumThreads.forEach((forumThread) => {
                    forumThread.timeSinceString = getTimeDiffInString(forumThread.timeLastEdit);
                });

                pinnedThread.find({}).exec(async (err, allPinnedThreadIds) => {
                    if (err) {
                        console.log(err);
                    } else {
                        // get all the pinned threads
                        const allPinnedThreads = [];

                        for (let i = 0; i < allPinnedThreadIds.length; i++) {
                            await forumThread.findById(allPinnedThreadIds[i].forumThread.id, (err, pinnedThread) => {
                                if (err) {
                                    console.log(err);
                                } else if (pinnedThread && pinnedThread.timeLastEdit) {
                                    pinnedThread.timeSinceString = getTimeDiffInString(pinnedThread.timeLastEdit);
                                    allPinnedThreads.push(pinnedThread);
                                }
                            });
                        }


                        let userNotifications = [];

                        if (req.user.username) {
                            await User.findOne({ username: req.user.username }).populate("notifications").exec((err, foundUser) => {
                                if (foundUser.notifications && foundUser.notifications !== null || foundUser.notifications !== undefined) {
                                    userNotifications = foundUser.notifications;
                                    console.log(foundUser.notifications);
                                }
                                res.render("forum/index", {
                                    allPinnedThreads,
                                    allForumThreads,
                                    currentUser: req.user,
                                    pageNum: req.params.pageNum,
                                    activeCategory: req.params.category,
                                    userNotifications,
                                    mod,
                                });
                            });
                        } else {
                            res.render("forum/index", {
                                allPinnedThreads,
                                allForumThreads,
                                pageNum: req.params.pageNum,
                                activeCategory: req.params.category,
                                mod,
                            });
                        }
                    }
                });
            }
        });
});


router.post("/modAction", middleware.isMod, (req, res) => {
    console.log(req.body);
    console.log("Reached forum mod action.");

    let replyId;
    if (req.body.idOfReply !== "") {
        replyId = mongoose.Types.ObjectId(req.body.idOfReply);
    }
    let commentId;
    if (req.body.idOfComment !== "") {
        commentId = mongoose.Types.ObjectId(req.body.idOfComment);
    }
    let forumId;
    if (req.body.idOfForum !== "") {
        forumId = mongoose.Types.ObjectId(req.body.idOfForum);
    }

    const newModAction = {
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

    modAction.create(newModAction);


    forumThread.findById(req.body.idOfForum).populate({ path: "comments", populate: { path: "replies" } }).exec((err, foundForumThread) => {
        if (err) { console.log(err); } else if (req.body.typeOfForumElement === "forum") {
            console.log("modaction forum");
            foundForumThread.disabled = true;
            foundForumThread.save();
        } else {
            forumThreadComment.findById(req.body.idOfComment).populate("replies").exec((err, comment) => {
                if (req.body.typeOfForumElement === "comment") {
                    console.log("modaction comment");
                    comment.oldText = comment.text;
                    comment.text = "*Deleted*";
                    comment.disabled = true;
                    comment.save(() => {
                        foundForumThread.markModified("comments");
                        foundForumThread.save();
                    });
                } else {
                    forumThreadCommentReply.findById(req.body.idOfReply).exec((err, reply) => {
                        console.log("modaction reply");
                        reply.oldText = reply.text;
                        reply.text = "*Deleted*";
                        reply.disabled = true;
                        reply.save(() => {
                            comment.markModified("replies");
                            comment.save(() => {
                                foundForumThread.markModified("comments");
                                foundForumThread.save();
                            });
                        });
                    });
                }
            });
        }
    });
});


router.post("/pinThread", middleware.isMod, (req, res) => {
    console.log(req.body);
    console.log("Reached pin thread.");

    let idOfThread = "";
    for (const key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            idOfThread = key;
        }
    }
    console.log(idOfThread);

    pinnedThread.findOne({ forumThread: { id: mongoose.Types.ObjectId(idOfThread) } }).exec((err, pin) => {
        console.log(pin);
        if (err) {
            console.log(err);
        } else if (pin !== null) {
            console.log("removing");
            pinnedThread.findByIdAndRemove(pin._id, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("done");
                }
            });
        } else {
            forumThread.findById(mongoose.Types.ObjectId(idOfThread)).exec((err, foundForumThread) => {
                if (foundForumThread) {
                    pinnedThread.create({ forumThread: { id: foundForumThread.id } });
                }
            });
        }
    });
});

module.exports = router;
