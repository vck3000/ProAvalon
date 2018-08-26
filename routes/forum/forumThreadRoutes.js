var express = require("express");
var router = express.Router();
var forumThread = require("../../models/forumThread");
var forumThreadComment = require("../../models/forumThreadComment");
var forumThreadCommentReply = require("../../models/forumThreadCommentReply");
var lastIds = require("../../models/lastIds");
var middleware = require("../../middleware");
var sanitizeHtml = require('sanitize-html');
var getTimeDiffInString = require("../../assets/myLibraries/getTimeDiffInString");
var User 			= require("../../models/user");

var mongoose = require('mongoose');

var modsArray = require("../../modsadmins/mods");
var adminsArray = require("../../modsadmins/admins");



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


/**********************************************************/
//Show the forumThread
/**********************************************************/
router.get("/show/:id", middleware.isLoggedIn, function (req, res) {
	forumThread.findById(req.params.id)
	// .populate("comments")
	// .populate({ path: "comments", populate: { path: "replies" } })
	.populate({ path: "comments", populate: { path: "replies"}})
	.exec( async function (err, foundForumThread) {
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

			var mod = false;
			//if they're mod then allow them see disabled posts.
			if(modsArray.indexOf(req.user.username.toLowerCase()) !== -1){
				mod = true;
			}

			// remove any replies and comments that are disabled if not a moderator is viewing
			// if(mod === false){
			// 	console.log(foundForumThread.comments);

			// 	for(var i = foundForumThread.comments.length - 1; i >= 0; i--){
			// 		// console.log(foundForumThread.comments[i].disabled);
			// 		if(foundForumThread.comments[i].disabled && foundForumThread.comments[i].disabled === true){
			// 			console.log("Remove a comment");
			// 			foundForumThread.comments[i].oldText = "";
			// 		}
			// 	}
			// }



			//update the time since string for forumThread
			var timeSince = getTimeDiffInString(foundForumThread.timeLastEdit);
			foundForumThread.timeSinceString = timeSince;

			//update the time since string for each comment
			foundForumThread.comments.forEach(function (comment) {
				comment.timeSinceString = getTimeDiffInString(comment.timeLastEdit);

				//update the time since string for each reply to a comment
				comment.replies.forEach(function (reply) {
					reply.timeSinceString = getTimeDiffInString(reply.timeLastEdit);
					// console.log("client: ");
					// console.log(reply.clients);
				});

				// console.log(comment.replies);
			});

			var userIdString = req.user._id.toString().replace(" ", "");

			var idsOfLikedPosts = [];
			//have they liked the main post already?
			if(foundForumThread.whoLikedId){
				for(var i = 0; i < foundForumThread.whoLikedId.length; i++){
					if(foundForumThread.whoLikedId[i] && foundForumThread.whoLikedId[i].toString().replace(" ", "") === userIdString){
						idsOfLikedPosts[0] = foundForumThread._id;
						console.log("added");
						break;
					}
				}
			}

			// console.log("liked: ");
			// console.log(typeof(foundForumThread.whoLikedId[0].toString()));
			// console.log(typeof(userIdString));
			// console.log(foundForumThread.whoLikedId[0].toString === userIdString);
			

			foundForumThread.comments.forEach(function (comment) {
				if(comment.whoLikedId){
					for(var i = 0; i < comment.whoLikedId.length; i++){
						if(comment.whoLikedId[i] && comment.whoLikedId[i].toString().replace(" ", "") === userIdString){
							idsOfLikedPosts.push(comment._id);					
						}
					}
				}

				comment.replies.forEach(function (reply) {
					if(reply.whoLikedId){
						for(var i = 0; i < reply.whoLikedId.length; i++){
							if(reply.whoLikedId[i] && reply.whoLikedId[i].toString().replace(" ", "") === userIdString){
								idsOfLikedPosts.push(reply._id);					
							}
						}
					}
				});
			});

			// console.log("id of user");
			// console.log(req.user._id);

			// console.log(" who like dforum");
			// console.log(foundForumThread.whoLikedId[1]._id.toString());

			// console.log("equal?");
			// console.log(foundForumThread.whoLikedId[0]._id == (req.user._id.toString()));

			// console.log("ids");
			// console.log(idsOfLikedPosts);


			var userNotifications = [];

			await User.findOne({username: req.user.username}).populate("notifications").exec(function(err, foundUser){
				if(foundUser.notifications && foundUser.notifications !== null || foundUser.notifications !== undefined){
					userNotifications = foundUser.notifications;
					// console.log(foundUser.notifications);
				}

				var isMod = false;
				if(modsArray.indexOf(req.user.username.toLowerCase()) !== -1){
					isMod = true;
				}

				// console.log("AAA");
				// console.log(foundForumThread.disabled);
				// console.log(isMod);

				//if forumthread.disabled is true, and also the person is not a mod, then dont show
				if(foundForumThread.disabled === true && isMod === false){
					req.flash("error", "Thread is deleted.");
					res.redirect("/forum/page/1");
				}
				else{

					res.render("forum/show", {
						userNotifications: userNotifications,
						forumThread: foundForumThread, 
						currentUser: req.user,
						idsOfLikedPosts: idsOfLikedPosts,
						mod: isMod
					});		

					//Below is seen/unseen code
	
					//if there is no seen users array, create it and add the user
					if(!foundForumThread.seenUsers){
						foundForumThread.seenUsers = [];
					}
					//if the viewing user isnt on the list, then add them.
					if(foundForumThread.seenUsers.indexOf(req.user.username.toLowerCase()) === -1){
						foundForumThread.seenUsers.push(req.user.username.toLowerCase());
					}
	
					// for every comment, add the user to seen users
					foundForumThread.comments.forEach(async function (comm){
						var changesMade = false;
						
						//see all the comments
						if(!comm.seenUsers){comm.seenUsers = [];}
						//if the user isnt on the list, add them. otherwise no need.
						if(comm.seenUsers.indexOf(req.user.username.toLowerCase()) === -1){
							comm.seenUsers.push(req.user.username.toLowerCase());
							changesMade = true;
						}
						//see all the replies
						comm.replies.forEach(async function (rep){
							if(!rep.seenUsers){rep.seenUsers = [];}
							//if the user isnt on the list, add them. otherwise no need.
							if(rep.seenUsers.indexOf(req.user.username.toLowerCase()) === -1){
								rep.seenUsers.push(req.user.username.toLowerCase());
								changesMade = true;
								await rep.save();
							}
						});
	
						//only need to comm.save() if there was a change.
						//otherwise save some resources and skip saving.
						if(changesMade === true){
							comm.markModified("replies");
							await comm.save();
						}
					});
					//there is always at least one change, so just save.
					foundForumThread.markModified("comments");
					foundForumThread.save();
				}
			});
		}
	});
});

/**********************************************************/
//Show the create new forumThread page
/**********************************************************/
router.get("/new", middleware.isLoggedIn, function (req, res) {
	// console.log("NEW STUFF ");
	res.render("forum/new", { currentUser: req.user, userNotifications: []});
});


//if this is the first.
lastIds.findOne({}).exec(async function (err, returnedLastId) {
	if(!returnedLastId){
		await lastIds.create({number: 1});
	}
});


/**********************************************************/
//Create a new forumThread
/**********************************************************/
router.post("/", middleware.isLoggedIn, async function (req, res) {
	const util = require('util');

    //get the category based on the user selection
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
    
    //grab the next number id from db
	var number = 0;
	await lastIds.findOne({}).exec(async function (err, returnedLastId) {

		if(!returnedLastId){
			await lastIds.create({number: 1});
		}

		number = returnedLastId.number;
		returnedLastId.number++;
		await returnedLastId.save();

		var newForumThread = {
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
                username: req.user.username
            },
			comments: [],
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
});






/**********************************************************/
//Show the edit forumThread route
/**********************************************************/
router.get("/:id/edit", middleware.checkForumThreadOwnership, function (req, res) {
	forumThread.findById(req.params.id, async function (err, foundForumThread) {
		var userNotifications = [];

		await User.findOne({username: req.user.username}).populate("notifications").exec(function(err, foundUser){
			if(foundUser.notifications && foundUser.notifications !== null || foundUser.notifications !== undefined){
				userNotifications = foundUser.notifications;
				console.log(foundUser.notifications);
			}
			
			res.render("forum/edit", { forumThread: foundForumThread, currentUser: req.user, userNotifications: userNotifications });

		});

	});
});

/**********************************************************/
//Update the forumThread route
/**********************************************************/
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

	//Even though EJS <%= %> doesn't allow for injection, it still displays and in case it fails,
	//we should sanitize the title anyway.

	forumThread.findById(req.params.id, function (err, foundForumThread) {
		if (err) {
			req.flash("error", "There was an error finding your forum thread.");
			res.redirect("/forum");
		} else {

			if (categoryChange === true) {
				//update the category
				foundForumThread.category = category;
			}
		
			//add the required changes for an edit
			foundForumThread.edited = true;
			foundForumThread.timeLastEdit = new Date();
			foundForumThread.whoLastEdit = req.user.username;
			
			//sanitize the description once again
			foundForumThread.description = sanitizeHtml(req.body.forumThread.description, {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
				allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
			});

			foundForumThread.title = sanitizeHtml(req.body.forumThread.title);
			
			foundForumThread.save();

			res.redirect("/forum/show/" + foundForumThread.id);
		}
	});
});


/**********************************************************/
//Destroy the forumThread route
/**********************************************************/
router.delete("/deleteForumThread/:id", middleware.checkForumThreadOwnership, function (req, res) {
	forumThread.findById(req.params.id, function (err, foundForumThread) {
		if (err) {
			res.redirect("/forum");
		} else {
			console.log("Deleted (disabled) a forumThread by the author.");

			foundForumThread.disabled = true;
			foundForumThread.save();

			res.redirect("/forum");
		}
	});
});


module.exports = router;