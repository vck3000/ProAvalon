var express = require("express");
var router = express.Router();
var forumThread = require("../models/forumThread");
var forumThreadComment = require("../models/forumThreadComment");
var forumThreadCommentReply = require("../models/forumThreadCommentReply");
var lastIds = require("../models/lastIds");

var pinnedThread = require("../models/pinnedThread");

var middleware = require("../middleware");
var sanitizeHtml = require('sanitize-html');


router.get("/", function (req, res) {
	res.redirect("/forum/page/1");
});


router.get("/page/:pageNum", function (req, res) {
	//rendering the campgrounds.ejs file
	//and also passing in the array data
	//first campgrounds is the name of the obj we are passing
	//the second one is the data from the above array we are providing
	// res.render("campgrounds", {campgrounds: campgrounds});

	//if theres an invalid page num, redirect to page 1
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

	forumThread.find({}).sort({ timeCreated: 'descending' }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
		.exec(function (err, allForumThreads) {
			if (err) {
				console.log(err);
			}
			else {
				allForumThreads.forEach(function (forumThread) {
					forumThread.timeSinceString = getTimeDiffInString(forumThread.timeLastEdit);
				});

				pinnedThread.find({}).exec(async function (err, allPinnedThreadIds){
					if(err){
						console.log(err);
					}
					else{
						//get all the pinned threads
						var allPinnedThreads = [];

						for(var i = 0; i < allPinnedThreadIds.length; i++){
							await forumThread.findById(allPinnedThreadIds[i].forumThread.id, function(err, pinnedThread){
								
								pinnedThread.timeSinceString = getTimeDiffInString(pinnedThread.timeLastEdit);

								allPinnedThreads.push(pinnedThread);
							});
						}



						res.render("forum/index", {
							allPinnedThreads: allPinnedThreads,
							allForumThreads: allForumThreads,
							currentUser: req.user,
							pageNum: req.params.pageNum
						});
					}
				});
			}
		});
});

//creating new forumThread
router.post("/", middleware.isLoggedIn, async function (req, res) {
	const util = require('util');

	// console.log("inc data: " + util.inspect(req.body, { showHidden: false, depth: null }))

	// console.log("inc data: " + req.body);

	//get data from form and add to forumThread array
	var title = req.body.title;
	var description = req.body.description;

	description = sanitizeHtml(req.body.description, {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
		allowedAttributes: {
			a: [ 'href', 'name', 'target' ],
			img: ['src', 'style']
		}
	});

	var d1 = new Date();
	var d2 = new Date();

	var timeCreated = d1;

	var likes = 0;
	var numOfComments = 0;
	var timeLastEdit = d2;

	var hoursSinceLastEdit = 0;

	var author = {
		id: req.user._id,
		username: req.user.username
	}

	var comments = [];

	var category = "";
	if (req.body.avalon) {
		category = "avalon";
	}
	else if (req.body.offTopic) {
		category = "offTopic";
	}
	else if (req.body.suggestion) {
		category = "suggestion";
	}
	else if (req.body.bug) {
		category = "bug";
	}
	else {
		category = "offTopic";
	}

	var number = 0;
	await lastIds.findOne({}).exec(async function (err, returnedLastId) {
		console.log(returnedLastId.number);

		number = returnedLastId.number;
		returnedLastId.number++;

		await returnedLastId.save();


		var newForumThread = {
			title: title,
			description: description,

			hoursSinceLastEdit: hoursSinceLastEdit,
			timeCreated: timeCreated,

			likes: likes,
			numOfComments: numOfComments,
			timeLastEdit: timeLastEdit,

			author: author,
			comments: comments,
			category: category,
			numberId: number
		};

		//create a new campground and save to DB
		forumThread.create(newForumThread, function (err, newlyCreated) {
			if (err) {
				console.log(err);
			}
			else {
				//redirect back to campgrounds page
				res.redirect("/forum");
			}
		});
	});
	//PUT IT ALL TOGETHER
});

//this route should be above the :id one because of
//order
router.get("/new", middleware.isLoggedIn, function (req, res) {
	// console.log("NEW STUFF ");
	res.render("forum/new", { currentUser: req.user });
});

//show
router.get("/show/:id", function (req, res) {
	forumThread.findById(req.params.id).populate("comments").populate({ path: "comments", populate: { path: "replies" } }).exec(function (err, foundForumThread) {
		if (err) {
			// console.log(err);
			console.log("Thread not found, redirecting");
			res.redirect("/forum");
		}
		else {
			if (foundForumThread === null) {
				console.log("Thread not found, redirecting");
				res.redirect("/forum");

				return;
			}

			//update the time since string for forumThread
			var timeSince = getTimeDiffInString(foundForumThread.timeLastEdit);
			foundForumThread.timeSinceString = timeSince;

			//update the time since string for each comment
			foundForumThread.comments.forEach(function (comment) {
				comment.timeSinceString = getTimeDiffInString(comment.timeLastEdit);

				//update the time since string for each reply to a comment
				comment.replies.forEach(function (reply) {
					reply.timeSinceString = getTimeDiffInString(reply.timeLastEdit);
				});

				console.log(comment.replies);
			});

			// console.log("comments: " + foundForumThread.comments);

			res.render("forum/show", { forumThread: foundForumThread, currentUser: req.user });
		}
	});
});


//EDIT forumThread route
router.get("/:id/edit", middleware.checkForumThreadOwnership, function (req, res) {
	forumThread.findById(req.params.id, function (err, foundForumThread) {
		res.render("forum/edit", { forumThread: foundForumThread, currentUser: req.user });
	});
});

//update forumThread route
router.put("/:id", middleware.checkForumThreadOwnership, function (req, res) {
	//find and update the correct campground

	var category = "";
	var categoryChange = false;
	if (req.body.avalon) {
		category = "avalon";
		categoryChange = true;
	}
	else if (req.body.offTopic) {
		category = "offTopic";
		categoryChange = true;
	}
	else if (req.body.suggestion) {
		category = "suggestion";
		categoryChange = true;
	}
	else if (req.body.bug) {
		category = "bug";
		categoryChange = true;
	}

	if (categoryChange === true) {
		//update the category
		req.body.forumThread.category = category;
	}

	req.body.forumThread.edited = true;

	req.body.forumThread.timeLastEdit = new Date();

	req.body.forumThread.description = sanitizeHtml(req.body.forumThread.description, {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
		allowedAttributes: {
			a: [ 'href', 'name', 'target' ],
			img: ['src', 'style']
		}
	});

	forumThread.findByIdAndUpdate(req.params.id, req.body.forumThread, function (err, updatedForumThread) {
		if (err) {
			res.redirect("/forum");
		} else {
			res.redirect("/forum/show/" + updatedForumThread.id);
		}
	});
	//redirect to show page
});


//create new comment route
router.post("/:id/comment", middleware.isLoggedIn, async function (req, res) {

	var d = new Date();

	var commentData = {
		text: description = sanitizeHtml(req.body.comment.text),
		author: { id: req.user._id, username: req.user.username },

		timeCreated: d,
		timeLastEdit: d,

		likes: 0,

		replies: []
	}

	forumThreadComment.create(commentData, function (err, newComment) {

		console.log("new comment: " + newComment);

		console.log("Thread id: " + req.params.id);
		console.log("Redirecting to: " + "/forum/show/" + req.params.id);

		forumThread.findById(req.params.id).populate("comments").exec(function (err, foundForumThread) {
			console.log("title of thread found: " + foundForumThread.title);

			console.log("current comments: " + foundForumThread.comments);


			foundForumThread.comments.push(newComment);

			console.log("current comments after add: " + foundForumThread.comments);

			foundForumThread.save();

			//redirect to same forum thread
			res.redirect("/forum/show/" + req.params.id);
		});
	});
});

//edit a comment 
router.get("/:id/:comment_id/edit", middleware.checkForumThreadCommentOwnership, function (req, res) {

	forumThreadComment.findById(req.params.comment_id, function (err, foundComment) {
		if (err) {
			console.log("ERROR: " + err);
		}
		res.render("forum/comment/edit", { comment: foundComment, forumThread: { id: req.params.id } });
	})
});


//update forumThreadComment route
router.put("/:id/:comment_id", middleware.checkForumThreadCommentOwnership, function (req, res) {
	//find and update the correct campground

	forumThreadComment.findById(req.params.comment_id, req.body.comment, async function (err, foundComment) {

		if (err) {
			res.redirect("/forum");
		} else {

			foundComment.text = sanitizeHtml(req.body.comment.text);
			foundComment.edited = true;

			await foundComment.save();

			// forumThread.findById(req.params.id)
			forumThread.findById(req.params.id).populate("comments").exec(async function (err, foundForumThread) {
				console.log("found forum thread:");
				console.log(req.params.id);

				foundForumThread.markModified("comments");
				await foundForumThread.save();

				//redirect to the forum page
				// req.flash("success", "Comment updated successfully.");
				res.redirect("/forum/show/" + req.params.id);
			});
		}
	});
});







//create new comment reply route
router.post("/:id/:commentId", middleware.isLoggedIn, async function (req, res) {

	var d = new Date();

	var commentReplyData = {
		text: sanitizeHtml(req.body.comment.text),
		author: { id: req.user._id, username: req.user.username },

		timeCreated: d,
		timeLastEdit: d,

		likes: 0,
	}

	forumThreadCommentReply.create(commentReplyData, function (err, newCommentReply) {

		// console.log("new commentReply: " + newCommentReply);

		forumThreadComment.findById(req.params.commentId).populate("replies").exec(function (err, foundForumThreadComment) {
			if (foundForumThreadComment.replies === undefined) {
				foundForumThreadComment.replies = [];
			}

			foundForumThreadComment.replies.push(newCommentReply);
			foundForumThreadComment.save();

			forumThread.findById(req.params.id).populate("comments").exec(function (err, foundForumThread) {
				foundForumThread.markModified("comments");
				foundForumThread.save();
			});

			//redirect to same forum thread
			res.redirect("/forum/show/" + req.params.id);
		});
	});
});

//edit a comment reply
router.get("/:id/:comment_id/:reply_id/edit", middleware.checkForumThreadCommentReplyOwnership, function (req, res) {
	forumThreadCommentReply.findById(req.params.reply_id, function (err, foundReply) {
		if (err) {
			console.log("ERROR: " + err);
		}
		res.render("forum/comment/reply/edit", { reply: foundReply, comment: {id: req.params.comment_id}, forumThread: { id: req.params.id } });
	});
});

//update forumThreadCommentReply route
router.put("/:id/:comment_id/:reply_id", middleware.checkForumThreadCommentReplyOwnership, function (req, res) {
	console.log("Edit a reply");
	
	forumThreadCommentReply.findById(req.params.reply_id, async function (err, foundReply) {
		if (err) {
			res.redirect("/forum");
		} else {
			foundReply.text = sanitizeHtml(req.body.reply.text);
			foundReply.edited = true;
			foundReply.timeLastEdit = new Date();
			await foundReply.save();

			// forumThread.findById(req.params.id)
			forumThreadComment.findById(req.params.comment_id).populate("replies").exec(async function (err, foundForumThreadComment) {

				foundForumThreadComment.markModified("replies");
				await foundForumThreadComment.save();

				//redirect to the forum page
				// req.flash("success", "Comment updated successfully.");
				res.redirect("/forum/show/" + req.params.id);
			});
		}
	});
});


//destroy forumThread route
router.delete("/:id", middleware.checkForumThreadOwnership, function (req, res) {
	forumThread.findByIdAndRemove(req.params.id, function (err) {
		if (err) {
			res.redirect("/forum");
		} else {
			console.log("Deleted a forumThread.");
			res.redirect("/forum");
		}
	});
});


function getTimeDiffInString(inputTime) {

	var currentDate = new Date();
	var dateDifference = new Date(currentDate - inputTime);

	//set it to seconds
	var timeSince = (dateDifference / 1000);

	// console.log(timeSince);
	if (timeSince < 60) {
		timeSince = Math.floor(timeSince) + " sec";
	}
	else if (timeSince / 60 < 60) {
		timeSince = Math.floor(timeSince / 60) + " min";
	}
	else if (timeSince / 60 / 60 < 24) {
		timeSince = Math.floor(timeSince / 60 / 60) + " hr";
	}
	else if (timeSince / 60 / 60 / 24 < 30) {
		timeSince = (Math.floor(timeSince / 60 / 60 / 24)) + " day";
	}
	else if (timeSince / 60 / 60 / 24 / 30 < 12) {
		timeSince = (Math.floor(timeSince / 60 / 60 / 24 / 30)) + " mth";
	}
	else {
		timeSince = (Math.floor(timeSince / 60 / 60 / 24 / 30 / 12)) + " yr";
	}

	return timeSince;
}



module.exports = router;