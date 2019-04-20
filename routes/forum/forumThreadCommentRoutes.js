var express = require("express");
var router = express.Router();
var forumThread = require("../../models/forumThread");
var forumThreadComment = require("../../models/forumThreadComment");
var lastIds = require("../../models/lastIds");
var middleware = require("../../middleware");
var sanitizeHtml = require('sanitize-html');
var getTimeDiffInString = require("../../assets/myLibraries/getTimeDiffInString");
var User = require("../../models/user");
var mongoose = require('mongoose');

var createNotificationObj = require("../../myFunctions/createNotification");

// Prevent too many requests
const rateLimit = require("express-rate-limit");


// var sanitizeHtmlAllowedTagsForumThread = ['u'];

var sanitizeHtmlAllowedTagsForumThread = ['img', 'iframe', 'h1', 'h2', 'u', 'span', 'br'];
var sanitizeHtmlAllowedAttributesForumThread = {
	a: ['href', 'name', 'target'],
	img: ['src', 'style'],
	iframe: ['src', 'style'],
	// '*': ['style'],
	table: ['class'],

	p: ['style'],

	span: ['style'],
	b: ['style']
};


const newCommentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hours
    max: 15
});
/**********************************************************/
//Create new comment route
/**********************************************************/
router.post("/:id/comment", newCommentLimiter, middleware.isLoggedIn, async function (req, res) {

	var commentData = {

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

		//the creator has already seen it
		seenUsers: [req.user.username.toLowerCase()]
	}

	forumThreadComment.create(commentData, function (err, newComment) {
		// console.log("new comment: " + newComment);
		// console.log("Thread id: " + req.params.id);
		// console.log("Redirecting to: " + "/forum/show/" + req.params.id);

		forumThread.findById(mongoose.Types.ObjectId(req.params.id)).populate("comments").exec(function (err, foundForumThread) {
			// console.log("title of thread found: " + foundForumThread.title);
			// console.log("current comments: " + foundForumThread.comments);
			foundForumThread.comments.push(newComment);
			// console.log("current comments after add: " + foundForumThread.comments);

			//add 1 to the num of comments
			foundForumThread.numOfComments = foundForumThread.numOfComments + 1;
			//update time last edited
			foundForumThread.timeLastEdit = new Date();
			foundForumThread.whoLastEdit = req.user.username;

			//now saving down the bottom
			// foundForumThread.save();

			// console.log(foundForumThread.author.id)

			//Set up a new notification
			console.log(foundForumThread.author);
			if (foundForumThread.author.id) {

				//create notif
				var userIdTarget = mongoose.Types.ObjectId(foundForumThread.author.id);
				var stringToSay = req.user.username + " has commented on your post.";
				var link = ("/forum/show/" + foundForumThread._id + "#" + newComment._id);

				createNotificationObj.createNotification(userIdTarget, stringToSay, link, req.user.username);
			}


			//redirect to same forum thread
			res.redirect("/forum/show/" + req.params.id);

			//since there is a new comment, the thread is now refreshed and no one has seen the new changes yet,
			//except for the one who made the comment
			foundForumThread.seenUsers = [req.user.username.toLowerCase()];
			foundForumThread.save();

		});


	});
});


/**********************************************************/
//Show the edit a comment page
/**********************************************************/
router.get("/:id/:comment_id/edit", middleware.checkForumThreadCommentOwnership, function (req, res) {
	forumThreadComment.findById(req.params.comment_id, async function (err, foundComment) {
		if (err) {
			console.log("ERROR: " + err);
		}
		if (foundComment.disabled === true) {
			req.flash("error", "Comment has been deleted.");
			res.redirect("back");
		}
		else {
			var userNotifications = [];

			await User.findById(req.user._id).populate("notifications").exec(function (err, foundUser) {
				if (!err) { userNotifications = foundUser.userNotifications; }
			});
			res.render("forum/comment/edit", { comment: foundComment, forumThread: { id: req.params.id }, userNotifications: userNotifications });
		}

	});
});


/**********************************************************/
//Update a comment route
/**********************************************************/
router.put("/:id/:comment_id", middleware.checkForumThreadCommentOwnership, function (req, res) {
	//find and update the correct campground

	forumThreadComment.findById(req.params.comment_id, async function (err, foundComment) {

		if (err) {
			res.redirect("/forum");
		} else {

			console.log("AAA");
			console.log(foundComment.disabled);

			if (foundComment.disabled === true) {
				req.flash("error", "You cannot edit a deleted comment.");
				//make them refresh to see the req.flash;
				res.redirect('back');
			}
			else {
				foundComment.text = sanitizeHtml(req.body.comment.text, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
					allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
				}),


					foundComment.edited = true;
				foundComment.timeLastEdit = new Date();

				await foundComment.save();

				// forumThread.findById(req.params.id)
				forumThread.findById(req.params.id).populate("comments").exec(async function (err, foundForumThread) {
					console.log("found forum thread:");
					console.log(req.params.id);

					foundForumThread.markModified("comments");
					//update time last edited
					foundForumThread.timeLastEdit = new Date();
					foundForumThread.whoLastEdit = req.user.username;

					await foundForumThread.save();

					//redirect to the forum page
					// req.flash("success", "Comment updated successfully.");
					res.redirect("/forum/show/" + req.params.id);
				});
			}
		}
	});
});


/**********************************************************/
//Destroy a comment route
/**********************************************************/
router.delete("/deleteComment/:id/:comment_id", middleware.checkForumThreadCommentOwnership, function (req, res) {
	console.log("Reached delete comment route")
	forumThreadComment.findById(req.params.comment_id, function (err, foundComment) {
		if (err) {
			res.redirect("/forum");
		} else {
			console.log("Deleted (disabled) a comment by author.");
			console.log("thread id " + req.params.id);

			foundComment.disabled = true;
			foundComment.oldText = foundComment.text;
			foundComment.text = "*Deleted*";


			foundComment.save(function () {
				forumThread.findById(req.params.id).populate("comments").exec(async function (err, foundForumThread) {
					foundForumThread.markModified("comments");
					await foundForumThread.save();
				});

				res.redirect("/forum/" + req.params.id);
			});


		}
	});
});

module.exports = router;