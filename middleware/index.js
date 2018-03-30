//all middleware goes here
var forumThread = require("../models/forumThread");
var forumThreadComment = require("../models/forumThreadComment");
var forumThreadCommentReply = require("../models/forumThreadCommentReply");


var middlewareObj = {};


middlewareObj.checkForumThreadOwnership = function (req, res, next) {
	if (req.isAuthenticated()) {
		forumThread.findById(req.params.id, function (err, foundForumThread) {
			if (err) {
				req.flash("error", "forumThread not found!");
				res.redirect("back");
			} else {
				//does user own campground?
				if (foundForumThread.author.id && foundForumThread.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You are not the owner!");
					console.log(req.user._id + " " + req.user.username +  " has attempted to do something bad");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

middlewareObj.checkForumThreadCommentOwnership = function (req, res, next) {
	if (req.isAuthenticated()) {
		forumThreadComment.findById(req.params.comment_id, function (err, foundComment) {
			if (err) {
				res.redirect("back");
			} else {
				//does user own comment?
				if(foundComment === undefined || foundComment === null){
					req.flash("error", "Comment not found?");
					console.log("lol " + req.params.comment_id)
					res.redirect("back");
				}
				else if (foundComment && foundComment.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You are not the owner!");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

middlewareObj.checkForumThreadCommentReplyOwnership = function (req, res, next) {
	if (req.isAuthenticated()) {
		forumThreadCommentReply.findById(req.params.reply_id, function (err, foundReply) {
			if (err) {
				res.redirect("back");
			} else {
				//does user own comment?
				if (foundReply && foundReply.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You are not the owner!");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		console.log("logged in as " + req.user._id + " and " + req.user.username);

		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/");
}

module.exports = middlewareObj;