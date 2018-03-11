//all middleware goes here
var forumThread = require("../models/forumThread");
var forumThreadComment = require("../models/forumThreadComment");


var middlewareObj = {};


middlewareObj.checkForumThreadOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		forumThread.findById(req.params.id, function(err, forumThread){
			if(err){
				req.flash("error", "forumThread not found!");
				res.redirect("back");
			} else{
				//does user own campground?
				if(forumThread.author.id.equals(req.user._id)){
					next();
				} else{
					req.flash("error", "You are not the owner!");
					res.redirect("back");
				}
			}
		});
	} else{
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

middlewareObj.checkForumThreadCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		forumThreadComment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back");
			} else{
				//does user own campground?
				if(foundComment.author.id.equals(req.user._id)){
					next();
				} else{
					req.flash("error", "You are not the owner!");
					res.redirect("back");
				}
			}
		});
	} else{
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		console.log("logged in as " + req.user._id + " and " + req.user.username);

		//if they have logged through the lobby
		//otherwise redirect them.
		if(res.app.locals.originalUsername){
			return next();
		}
		else{
			console.log("They dont have an original username. Redirecting");
		}
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/");
}

module.exports = middlewareObj;