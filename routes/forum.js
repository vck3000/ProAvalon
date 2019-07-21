var express = require("express");
var router = express.Router();
var forumThread = require("../models/forumThread");
var forumThreadComment = require("../models/forumThreadComment");
var forumThreadCommentReply = require("../models/forumThreadCommentReply");
var lastIds = require("../models/lastIds");
var middleware = require("../middleware");
var sanitizeHtml = require('sanitize-html');

var pinnedThread = require("../models/pinnedThread");
var getTimeDiffInString = require("../assets/myLibraries/getTimeDiffInString");

var User = require("../models/user");
var createNotificationObj = require("../myFunctions/createNotification");

var mongoose = require("mongoose");


var modsArray = require("../modsadmins/mods");
var adminsArray = require("../modsadmins/admins");
var modAction = require("../models/modAction");


//grab the routes
var forumThreadRoutes = require("../routes/forum/forumThreadRoutes");
router.use(forumThreadRoutes);

var forumThreadCommentRoutes = require("../routes/forum/forumThreadCommentRoutes");
router.use(forumThreadCommentRoutes);

var forumThreadCommentReplyRoutes = require("../routes/forum/forumThreadCommentReplyRoutes");
router.use(forumThreadCommentReplyRoutes);


router.get("/", middleware.isLoggedIn, function (req, res) {
	res.redirect("/forum/page/1");
});

//Player liking a thing
// router.get("/ajax/like/:type/:bigId", middleware.isLoggedIn, function(req, res){
router.get("/ajax/like/:type/:bigId", middleware.isLoggedIn, function (req, res) {
	console.log("Routed here");

	var splitted = req.params.bigId.split("=");

	forumId = splitted[0];
	commentId = splitted[1];
	replyId = splitted[2];

	forumThread.findById(forumId).populate("comments").exec(function (err, foundThread) {
		if (!foundThread) {
			res.status(200).send("failed");
		}
		else {
			if (req.params.type === "forum") {
				if (foundThread.whoLikedId === undefined) {
					foundThread.whoLikedId = [];
				}
				if (foundThread.whoLikedId.indexOf(req.user._id) !== -1) {
					//person has already liked it
					//therefore, unlike it and remove their name
					var i = foundThread.whoLikedId.indexOf(req.user._id);
					//remove their id
					foundThread.whoLikedId.splice(i, 1);
					foundThread.likes -= 1;
					res.status(200).send("unliked");
				}
				else {
					//add a like
					foundThread.whoLikedId.push(req.user._id);
					foundThread.likes += 1;
					res.status(200).send("liked");

					//create notif toLowerCase() replying target
					var userIdTarget = foundThread.author.id;
					var stringToSay = req.user.username + " has liked your post!";
					var link = ("/forum/show/" + foundThread._id);

					createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);

					console.log(foundThread);
				}
			}
			else {
				forumThreadComment.findById(commentId).populate("replies").exec(function (err, foundComment) {
					if (req.params.type === "comment") {
						if (foundComment.whoLikedId === undefined) {
							foundComment.whoLikedId = [];
						}
						if (foundComment.whoLikedId.indexOf(req.user._id) !== -1) {
							//person has already liked it
							//therefore, unlike it and remove their name
							var i = foundComment.whoLikedId.indexOf(req.user._id);
							//remove their id
							foundComment.whoLikedId.splice(i, 1);
							foundComment.likes -= 1;
							res.status(200).send("unliked");
						}
						else {
							//add a like
							foundComment.whoLikedId.push(req.user._id);
							foundComment.likes += 1;
							res.status(200).send("liked");

							//create notif toLowerCase() replying target
							var userIdTarget = foundComment.author.id;
							var stringToSay = req.user.username + " has liked your comment!";
							var link = ("/forum/show/" + foundThread._id + "#" + foundComment._id);

							createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);



						}
					}
					else {
						forumThreadCommentReply.findById(replyId).exec(function (err, foundReply) {
							if (req.params.type === "reply") {
								if (foundReply.whoLikedId === undefined) {
									foundReply.whoLikedId = [];
								}
								if (foundReply.whoLikedId.indexOf(req.user._id) !== -1) {
									//person has already liked it
									//therefore, unlike it and remove their name
									var i = foundReply.whoLikedId.indexOf(req.user._id);
									//remove their id
									foundReply.whoLikedId.splice(i, 1);
									foundReply.likes -= 1;
									res.status(200).send("unliked");
								}
								else {
									//add a like
									foundReply.whoLikedId.push(req.user._id);
									foundReply.likes += 1;
									res.status(200).send("liked");

									//create notif toLowerCase() replying target
									var userIdTarget = foundReply.author.id;
									var stringToSay = req.user.username + " has liked your reply!";
									var link = ("/forum/show/" + foundThread._id + "#" + foundReply._id);

									createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);

								}
								foundReply.save(function () {
									foundComment.save(function () {
										foundThread.markModified("comments");
										foundThread.save();
									});
								});
								foundComment.markModified("replies");
							}
							else {
								res.status(200).send("error");
							}
						});
					}
					foundComment.save(function () {
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


router.get("/page/:category/:pageNum", middleware.isLoggedIn, function (req, res) {
	console.log("category");

	//if theres an invalid page num, redirect toLowerCase() page 1
	if (req.params.pageNum < 1) {
		res.redirect("/forum/page/" + req.params.category + "/1");
	}

	//get all forumThreads from DB
	//then render

	var NUM_OF_RESULTS_PER_PAGE = 10;
	//if user specified num of results per page:
	if (req.params.numOfResultsPerPage) {
		NUM_OF_RESULTS_PER_PAGE = req.params.numOfResultsPerPage;
	}

	var skipNumber = 0;
	//if we have a specified pageNum, then skip a bit
	if (req.params.pageNum) {
		//-1 because page numbers start at 1
		skipNumber = (req.params.pageNum - 1) * NUM_OF_RESULTS_PER_PAGE;
	}

	forumThread.find({
		category: req.params.category,
		$or: [
			{ disabled: undefined },
			{ disabled: false }
		]
	}).sort({ timeLastEdit: 'descending' }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
		.exec(async function (err, allForumThreads) {

			if (err) {
				console.log(err);
			}
			else {
				allForumThreads.forEach(function (forumThread) {
					forumThread.timeSinceString = getTimeDiffInString(forumThread.timeLastEdit);
				});

				var userNotifications = [];

				if (req.user.username) {
					await User.findOne({ username: req.user.username }).populate("notifications").exec(function (err, foundUser) {
						if (foundUser.notifications && foundUser.notifications !== null || foundUser.notifications !== undefined) {
							userNotifications = foundUser.notifications;
							// console.log(foundUser.notifications);
						}

						res.render("forum/index", {
							allPinnedThreads: [],
							allForumThreads: allForumThreads,
							currentUser: req.user,
							pageNum: req.params.pageNum,
							activeCategory: req.params.category,
							userNotifications: userNotifications
						});
					});
				}
				else {
					res.render("forum/index", {
						allPinnedThreads: [],
						allForumThreads: allForumThreads,
						pageNum: req.params.pageNum,
						activeCategory: req.params.category
					});
				}




			}
		});
});


//main page that users land on
router.get("/page/:pageNum", middleware.isLoggedIn, function (req, res) {
	// console.log("pageNum");

	//if theres an invalid page num, redirect toLowerCase() page 1
	if (req.params.pageNum < 1) {
		res.redirect("/forum/page/1");
	}

	//get all forumThreads from DB
	//then render

	var NUM_OF_RESULTS_PER_PAGE = 10;
	if (req.params.numOfResultsPerPage) {
		NUM_OF_RESULTS_PER_PAGE = req.params.numOfResultsPerPage;
	}

	var skipNumber = 0;

	//if we have a specified pageNum, then skip a bit
	if (req.params.pageNum) {
		//-1 because page numbers start at 1
		skipNumber = (req.params.pageNum - 1) * NUM_OF_RESULTS_PER_PAGE;
	}

	var or = [
		{ disabled: undefined },
		{ disabled: false }
	]

	var mod = false;
	//if they're mod then allow them toLowerCase() see disabled posts.
	var modSee = { disabled: false };
	if (modsArray.indexOf(req.user.username.toLowerCase()) !== -1) {
		modSee = { disabled: true };
		mod = true;
	}


	forumThread.find({
		$or: [
			{ disabled: undefined },
			{ disabled: false },
			modSee
		]
	}).sort({ timeLastEdit: 'descending' }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
		.exec(function (err, allForumThreads) {
			if (err) {
				console.log(err);
			}
			else {
				allForumThreads.forEach(function (forumThread) {
					forumThread.timeSinceString = getTimeDiffInString(forumThread.timeLastEdit);
				});

				pinnedThread.find({}).exec(async function (err, allPinnedThreadIds) {
					if (err) {
						console.log(err);
					}
					else {
						//get all the pinned threads
						var allPinnedThreads = [];

						for (var i = 0; i < allPinnedThreadIds.length; i++) {
							await forumThread.findById(allPinnedThreadIds[i].forumThread.id, function (err, pinnedThread) {
								if (err) {
									console.log(err);
								}
								else {
									if (pinnedThread && pinnedThread.timeLastEdit) {
										pinnedThread.timeSinceString = getTimeDiffInString(pinnedThread.timeLastEdit);
										allPinnedThreads.push(pinnedThread);
									}

								}

							});
						}


						var userNotifications = [];

						if (req.user.username) {
							await User.findOne({ username: req.user.username }).populate("notifications").exec(function (err, foundUser) {
								if (foundUser.notifications && foundUser.notifications !== null || foundUser.notifications !== undefined) {
									userNotifications = foundUser.notifications;
									console.log(foundUser.notifications);
								}
								res.render("forum/index", {
									allPinnedThreads: allPinnedThreads,
									allForumThreads: allForumThreads,
									currentUser: req.user,
									pageNum: req.params.pageNum,
									activeCategory: req.params.category,
									userNotifications: userNotifications,
									mod: mod
								});
							});
						}
						else {
							res.render("forum/index", {
								allPinnedThreads: allPinnedThreads,
								allForumThreads: allForumThreads,
								pageNum: req.params.pageNum,
								activeCategory: req.params.category,
								mod: mod
							});
						}



					}
				});
			}
		});
});


router.post("/modAction", middleware.isMod, function (req, res) {
	console.log(req.body);
	console.log("Reached forum mod action.");

	var replyId;
	if (req.body.idOfReply !== "") {
		replyId = mongoose.Types.ObjectId(req.body.idOfReply);
	}
	var commentId;
	if (req.body.idOfComment !== "") {
		commentId = mongoose.Types.ObjectId(req.body.idOfComment);
	}
	var forumId;
	if (req.body.idOfForum !== "") {
		forumId = mongoose.Types.ObjectId(req.body.idOfForum);
	}

	var newModAction = {
		type: req.body.typeofmodaction,
		bannedPlayer: {
			id: req.body.idOfPlayerToBan,
			username: req.body.banPlayerUsername
		},

		modWhoBanned: {
			id: req.user.id,
			username: req.user.username
		},

		reason: req.body.reasonofmodaction,
		whenMade: new Date(),
		descriptionByMod: req.body.descriptionByMod,
		idOfReply: replyId,
		idOfComment: commentId,
		idOfForum: forumId,
		elementDeleted: req.body.typeOfForumElement
	};

	modAction.create(newModAction);



	forumThread.findById(req.body.idOfForum).populate({ path: "comments", populate: { path: "replies" } }).exec(function (err, foundForumThread) {
		if (err) { console.log(err); }
		else {
			if (req.body.typeOfForumElement === "forum") {
				console.log("modaction forum");
				foundForumThread.disabled = true;
				foundForumThread.save();
			}
			else {
				forumThreadComment.findById(req.body.idOfComment).populate("replies").exec(function (err, comment) {
					if (req.body.typeOfForumElement === "comment") {
						console.log("modaction comment");
						comment.oldText = comment.text;
						comment.text = "*Deleted*";
						comment.disabled = true;
						comment.save(function () {
							foundForumThread.markModified("comments");
							foundForumThread.save();
						});
					}
					else {
						forumThreadCommentReply.findById(req.body.idOfReply).exec(function (err, reply) {
							console.log("modaction reply");
							reply.oldText = reply.text;
							reply.text = "*Deleted*";
							reply.disabled = true;
							reply.save(function () {
								comment.markModified("replies");
								comment.save(function () {
									foundForumThread.markModified("comments");
									foundForumThread.save();
								});
							});
						});
					}
				});
			}
		}
	});


});





router.post("/pinThread", middleware.isMod, function (req, res) {
	console.log(req.body);
	console.log("Reached pin thread.");

	var idOfThread = "";
	for (var key in req.body) {
		if (req.body.hasOwnProperty(key)) {
			idOfThread = key;
		}
	}
	console.log(idOfThread);

	pinnedThread.findOne({ forumThread: { id: mongoose.Types.ObjectId(idOfThread) } }).exec(function (err, pin) {
		console.log(pin);
		if (err) {
			console.log(err);
		}
		else {
			if (pin !== null) {
				console.log("removing");
				pinnedThread.findByIdAndRemove(pin._id, function (err) {
					if (err) {
						console.log(err);
					}
					else {
						console.log("done");
					}
				});
			}
			else {
				forumThread.findById(mongoose.Types.ObjectId(idOfThread)).exec(function (err, foundForumThread) {
					if (foundForumThread) {
						pinnedThread.create({ forumThread: { id: foundForumThread.id } });
					}
				});
			}
		}

	});



});

module.exports = router;