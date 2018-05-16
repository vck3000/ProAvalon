var express = require("express");
var router = express.Router();
var forumThread = require("../../models/forumThread");
var forumThreadComment = require("../../models/forumThreadComment");
var forumThreadCommentReply = require("../../models/forumThreadCommentReply");
var lastIds = require("../../models/lastIds");
var middleware = require("../../middleware");
var sanitizeHtml = require('sanitize-html');
var getTimeDiffInString = require("../../assets/myLibraries/getTimeDiffInString");

// var sanitizeHtmlAllowedTagsForumThread = ['u'];
var sanitizeHtmlAllowedTagsForumThread = ['img', 'iframe', 'h1', 'h2', 'u', 'span', 'br'];
var sanitizeHtmlAllowedAttributesForumThread = {
	a: ['href', 'name', 'target'],
	img: ['src', 'style'],
	iframe: ['src', 'style'],
	// '*': ['style'],
	table: ['class'],

	p: ['style'],

	span: ['style']
};


/**********************************************************/
//Create a new comment reply route
/**********************************************************/
router.post("/:id/:commentId", middleware.isLoggedIn, async function (req, res) {

	var d = new Date();

	var commentReplyData = {
		
		text: sanitizeHtml(req.body.comment.text, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
			allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
		}),

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
				//add 1 to the num of comments
				foundForumThread.numOfComments = foundForumThread.numOfComments + 1;
				foundForumThread.save();
			});

			//redirect to same forum thread
			res.redirect("/forum/show/" + req.params.id);
		});
	});
});

/**********************************************************/
//Edit a comment reply
/**********************************************************/
router.get("/:id/:comment_id/:reply_id/edit", middleware.checkForumThreadCommentReplyOwnership, function (req, res) {
	forumThreadCommentReply.findById(req.params.reply_id, function (err, foundReply) {
		if (err) {
			console.log("ERROR: " + err);
		}
		res.render("forum/comment/reply/edit", { reply: foundReply, comment: { id: req.params.comment_id }, forumThread: { id: req.params.id } });
	});
});

/**********************************************************/
//Update a comment reply route
/**********************************************************/
router.put("/:id/:comment_id/:reply_id", middleware.checkForumThreadCommentReplyOwnership, function (req, res) {
	console.log("Edit a reply");

	forumThreadCommentReply.findById(req.params.reply_id, async function (err, foundReply) {
		if (err) {
			res.redirect("/forum");
		} else {
			foundReply.text = sanitizeHtml(req.body.reply.text, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
                allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
            });
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


/**********************************************************/
//Destroy a comment reply route
/**********************************************************/
router.delete("/deleteCommentReply/:id/:comment_id/:reply_id", middleware.checkForumThreadCommentReplyOwnership, function (req, res) {
	console.log("Reached delete comment reply route");
	console.log("forum id: " + req.params.id);
	console.log("comment id: " + req.params.comment_id);
	console.log("reply id: " + req.params.reply_id);
	console.log(" ");


	forumThreadCommentReply.findByIdAndRemove(req.params.reply_id, function (err) {
		if (err) {
			res.redirect("/forum");
		} else {
			console.log("Deleted a reply.");
			forumThreadComment.findById(req.params.comment_id).populate("replies").exec(async function (err, foundComment) {
				if (err) {
					console.log(err);
				}
				else {
					foundComment.markModified("replies");
					await foundComment.save();

					console.log("A");


					forumThread.findById(req.params.id).populate("comments").exec(async function (err, foundForumThread) {
						if (err) {
							console.log(err);
						}
						else {
							foundForumThread.markModified("comments");
							await foundForumThread.save();
							console.log("B");
						}
					});
				}


			})
			res.redirect("/forum/" + req.params.id);
		}
	});
});

module.exports = router;