var express = require("express");
var router = express.Router();
var forumThread = require("../../models/forumThread");
var forumThreadComment = require("../../models/forumThreadComment");
var lastIds = require("../../models/lastIds");
var middleware = require("../../middleware");
var sanitizeHtml = require('sanitize-html');
var getTimeDiffInString = require("../../assets/myLibraries/getTimeDiffInString");

var sanitizeHtmlAllowedTagsForumThread = ['u'];


/**********************************************************/
//Create new comment route
/**********************************************************/
router.post("/:id/comment", middleware.isLoggedIn, async function (req, res) {

	var commentData = {
		text: description = sanitizeHtml(req.body.comment.text, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread)
        }),
		author: { id: req.user._id, username: req.user.username },
		timeCreated: new Date(),
		timeLastEdit: new Date(),
		likes: 0,
		replies: []
	}

	forumThreadComment.create(commentData, function (err, newComment) {
		// console.log("new comment: " + newComment);
		// console.log("Thread id: " + req.params.id);
		// console.log("Redirecting to: " + "/forum/show/" + req.params.id);

		forumThread.findById(req.params.id).populate("comments").exec(function (err, foundForumThread) {
			// console.log("title of thread found: " + foundForumThread.title);
			// console.log("current comments: " + foundForumThread.comments);
			foundForumThread.comments.push(newComment);
			// console.log("current comments after add: " + foundForumThread.comments);

			//add 1 to the num of comments
            foundForumThread.numOfComments = foundForumThread.numOfComments + 1;
            
            foundForumThread.save();
            
			//redirect to same forum thread
			res.redirect("/forum/show/" + req.params.id);
		});
	});
});


/**********************************************************/
//Show the edit a comment page
/**********************************************************/
router.get("/:id/:comment_id/edit", middleware.checkForumThreadCommentOwnership, function (req, res) {
	forumThreadComment.findById(req.params.comment_id, function (err, foundComment) {
		if (err) {
			console.log("ERROR: " + err);
		}
		res.render("forum/comment/edit", { comment: foundComment, forumThread: { id: req.params.id } });
	})
});


/**********************************************************/
//Update a comment route
/**********************************************************/
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


/**********************************************************/
//Destroy a comment route
/**********************************************************/
router.delete("/deleteComment/:id/:comment_id", middleware.checkForumThreadCommentOwnership, function (req, res) {
	console.log("Reached delete comment route")
	forumThreadComment.findByIdAndRemove(req.params.comment_id, function (err) {
		if (err) {
			res.redirect("/forum");
		} else {
			console.log("Deleted a comment.");

			console.log("thread id " + req.params.id);


			forumThread.findById(req.params.id).populate("comments").exec(async function (err, foundForumThread) {
				foundForumThread.markModified("comments");
				await foundForumThread.save();
			});

			res.redirect("/forum/" + req.params.id);
		}
	});
});

module.exports = router;