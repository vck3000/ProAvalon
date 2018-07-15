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

var User 			= require("../models/user");
var myNotification	= require("../models/notification");

var mongoose 		= require("mongoose");


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


// router.get("/ajax/like/:type/:bigId", middleware.isLoggedIn, function(req, res){
router.get("/ajax/like/:type/:bigId", middleware.isLoggedIn, function(req, res){
	console.log("Routed here");

	var splitted = req.params.bigId.split("=");

	forumId = splitted[0];
	commentId = splitted[1];
	replyId = splitted[2];

	// console.log(req.params.bigId);
	// console.log(forumId);
	// console.log(commentId);
	// console.log(replyId);
	// console.log(req.params.type);
	


	forumThread.findById(forumId).populate("comments").exec(function(err, foundThread){
		if(!foundThread){
			res.status(200).send("failed");
		}
		else{
			if(req.params.type === "forum"){
				if(foundThread.whoLikedId === undefined){
					foundThread.whoLikedId = [];
				}
				if(foundThread.whoLikedId.indexOf(req.user._id) !== -1){
					//person has already liked it
					//therefore, unlike it and remove their name
					var i = foundThread.whoLikedId.indexOf(req.user._id);
					//remove their id
					foundThread.whoLikedId.splice(i, 1);
					foundThread.likes -= 1;
					res.status(200).send("unliked");
				}
				else{
					//add a like
					foundThread.whoLikedId.push(req.user._id);
					foundThread.likes += 1;
					res.status(200).send("liked");

					createNotification(
						foundThread.author.id, 
						req.user.username + " has liked your post!", 
						("/forum/show/" + foundThread._id)
					);

					console.log(foundThread);
					
				}


				

				
			}
			else{
				forumThreadComment.findById(commentId).populate("replies").exec(function(err, foundComment){
					if(req.params.type === "comment"){
						if(foundComment.whoLikedId === undefined){
							foundComment.whoLikedId = [];
						}
						if(foundComment.whoLikedId.indexOf(req.user._id) !== -1){
							//person has already liked it
							//therefore, unlike it and remove their name
							var i = foundComment.whoLikedId.indexOf(req.user._id);
							//remove their id
							foundComment.whoLikedId.splice(i, 1);
							foundComment.likes -= 1;
							res.status(200).send("unliked");
						}
						else{
							//add a like
							foundComment.whoLikedId.push(req.user._id);
							foundComment.likes += 1;
							res.status(200).send("liked");

							createNotification(
								foundComment.author.id, 
								req.user.username + " has liked your comment!", 
								("/forum/show/" + foundThread._id + "#" + foundComment._id)
							);

							
						}
					}
					else{
						forumThreadCommentReply.findById(replyId).exec(function(err, foundReply){
							if(req.params.type === "reply"){
								if(foundReply.whoLikedId === undefined){
									foundReply.whoLikedId = [];
								}
								if(foundReply.whoLikedId.indexOf(req.user._id) !== -1){
									//person has already liked it
									//therefore, unlike it and remove their name
									var i = foundReply.whoLikedId.indexOf(req.user._id);
									//remove their id
									foundReply.whoLikedId.splice(i, 1);
									foundReply.likes -= 1;
									res.status(200).send("unliked");
								}
								else{
									//add a like
									foundReply.whoLikedId.push(req.user._id);
									foundReply.likes += 1;
									res.status(200).send("liked");

									createNotification(
										foundReply.author.id, 
										req.user.username + " has liked your reply!", 
										("/forum/show/" + foundThread._id + "#" + foundReply._id)
									);

								}
								foundReply.save(function(){
									foundComment.save(function(){
										foundThread.markModified("comments");	
										foundThread.save();
									});
								});
								foundComment.markModified("replies");
							}
							else{
								res.status(200).send("error");								
							}
						});
					}
					foundComment.save(function(){
						foundThread.markModified("comments");	
						foundThread.save();
					});
					foundThread.markModified("comments");					
				});
			}
			foundThread.save();
		}
	});










	// if(req.params.type === "forum"){
	// 	forumThread.findById(req.params.id).populate("whoLikedId").exec(function(err, foundThread){
	// 		if(err){console.log(err); res.status(200).send("failed");}
	// 		else{
				
	// 		}
	// 		foundThread.markModified("whoLikedId");
	// 		foundThread.save();
	// 	});
	// }

	// else if(req.params.type === "comment"){
	// 	forumThreadComment.findById(req.params.id).populate("whoLikedId").exec(function(err, foundComment){
	// 		if(err){console.log(err); res.status(200).send("failed");}
	// 		else{
	// 			if(foundComment.whoLikedId === undefined){
	// 				foundComment.whoLikedId = [];
	// 			}
	// 			if(foundComment.whoLikedId.indexOf(req.user._id) !== -1){
	// 				//person has already liked it
	// 				//therefore, unlike it and remove their name
	// 				var i = foundComment.whoLikedId.indexOf(req.user._id);
	// 				//remove their id
	// 				foundComment.whoLikedId.splice(i, 1);
	// 				foundComment.likes -= 1;
	// 				res.status(200).send("unliked");
	// 			}
	// 			else{
	// 				//add a like
	// 				foundComment.whoLikedId.push(req.user._id);
	// 				foundComment.likes += 1;
	// 				res.status(200).send("liked");
	// 			}
	// 		}
	// 		foundComment.markModified("whoLikedId");
	// 		foundComment.save();
	// 	});
	// }
	// else if(req.params.type === "reply"){
	// 	forumThreadCommentReply.findById(req.params.id).populate("whoLikedId").exec(function(err, foundReply){
	// 		if(err){console.log(err); res.status(200).send("failed");}
	// 		else{
	// 			if(foundReply.whoLikedId === undefined){
	// 				foundReply.whoLikedId = [];
	// 			}
	// 			if(foundReply.whoLikedId.indexOf(req.user._id) !== -1){
	// 				//person has already liked it
	// 				//therefore, unlike it and remove their name
	// 				var i = foundReply.whoLikedId.indexOf(req.user._id);
	// 				//remove their id
	// 				foundReply.whoLikedId.splice(i, 1);
	// 				foundReply.likes -= 1;
	// 				res.status(200).send("unliked");
	// 			}
	// 			else{
	// 				//add a like
	// 				foundReply.whoLikedId.push(req.user._id);
	// 				foundReply.likes += 1;
	// 				res.status(200).send("liked");
					
	// 			}
	// 		}

	// 		foundReply.markModified("whoLikedId");
	// 		foundReply.save();
	// 	});
	// }
	// else{
	// 	res.status(200).send("failed");
	// }

});

// router.get("/ajax/profile/getProfileData/:profileUsername", function(req, res){
// 	User.findOne({username: req.params.profileUsername}, function(err, foundUser){
// 		if(err){
// 			console.log(err);
// 		}
// 		else{
// 			res.status(200).send(foundUser);

// 			console.log("Received AJAX request");
// 		}
// 	});
// });


router.get("/page/:category/:pageNum", middleware.isLoggedIn, function(req, res){
	console.log("category");
	
	//if theres an invalid page num, redirect to page 1
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

	forumThread.find({category: req.params.category}).sort({ timeLastEdit: 'descending' }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
		.exec(async function (err, allForumThreads) {
			if (err) {
				console.log(err);
			}
			else {
				allForumThreads.forEach(function (forumThread) {
					forumThread.timeSinceString = getTimeDiffInString(forumThread.timeLastEdit);
				});

				var userNotifications = [];

				if(req.user.username){
					await User.findOne({username: req.user.username}).populate("notifications").exec(function(err, foundUser){
						if(foundUser.notifications && foundUser.notifications !== null || foundUser.notifications !== undefined){
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
				else{
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


router.get("/page/:pageNum", middleware.isLoggedIn, function (req, res) {
	console.log("pageNum");
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

	forumThread.find({}).sort({ timeLastEdit: 'descending' }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
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

								pinnedThread.timeSinceString = getTimeDiffInString(pinnedThread.timeLastEdit);

								allPinnedThreads.push(pinnedThread);
							});
						}

						

						var userNotifications = [];

						if(req.user.username){
							await User.findOne({username: req.user.username}).populate("notifications").exec(function(err, foundUser){
								if(foundUser.notifications && foundUser.notifications !== null || foundUser.notifications !== undefined){
									userNotifications = foundUser.notifications;
									console.log(foundUser.notifications);
								}
								res.render("forum/index", {
									allPinnedThreads: allPinnedThreads,
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
								allPinnedThreads: allPinnedThreads,
								allForumThreads: allForumThreads,
								pageNum: req.params.pageNum,
								activeCategory: req.params.category
							});		
						}
						

					
					}
				});
			}
		});
});


function createNotification(userID, stringToSay, link){
	if(userID){
		User.findById(mongoose.Types.ObjectId(userID)).populate("notifications")
		.exec(function(err, foundUser){

			console.log(foundUser.username);

		if(err){
			console.log(err);
		}
		else{
			notificationVar = {
				text: stringToSay,
				date: new Date(),
				link: link,

				forPlayer: foundUser.username,
				seen: false
			}
			// if(foundUser){
				myNotification.create(notificationVar, function(err, newNotif){
					// console.log(foundUser);
					if(foundUser.notifications){
						foundUser.notifications.push(newNotif);
						foundUser.markModified("notifications");
						foundUser.save();
					}
				});
			// }
			}
		});
	}
}




module.exports = router;