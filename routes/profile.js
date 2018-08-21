var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var sanitizeHtml = require('sanitize-html');
var User 			= require("../models/user");
var mongoose 		= require("mongoose");
var avatarRequest = require("../models/avatarRequest");
var createNotificationObj = require("../myFunctions/createNotification");


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


// router.get("/", middleware.isLoggedIn, function (req, res) {
// 	res.redirect("/forum/page/1");
// });



//Show the mod approving rejecting page
router.get("/avatargetlinktutorial", middleware.isLoggedIn, function(req, res){
	res.render("profile/avatargetlinktutorial");

});


//Show the mod approving rejecting page
router.get("/mod/customavatar", middleware.isMod, function(req, res){
	
	avatarRequest.find({processed: false}).exec(function(err, allAvatarRequests){
		if(err){console.log(err);}
		else{
			res.render("mod/customavatar", {customAvatarRequests: allAvatarRequests});
		}
	});
});

//moderator approve or reject custom avatar requests
// /profile/mod/ajax/processavatarrequest
router.post("/mod/ajax/processavatarrequest", middleware.isLoggedIn, middleware.isMod, function(req, res){
	console.log("process avatar request");
	console.log(req.body.decision);
	console.log(req.body.avatarreqid);
	console.log(req.body.modcomment);

	avatarRequest.findById(req.body.avatarreqid).exec(function(err, foundReq){
		if(err){console.log(err);}
		else{
			foundReq.processed = true;
			foundReq.modComment = req.body.modcomment;
			foundReq.approved = req.body.decision;
			foundReq.modWhoProcessed = req.user.username;

			if(req.body.decision === true || req.body.decision === "true"){
				console.log("search lower user: " + foundReq.forUsername.toLowerCase());

				User.findOne({usernameLower: foundReq.forUsername.toLowerCase()}).populate("notifications").exec(function(err, foundUser){
					if(err){console.log(err);}
					else{
						foundUser.avatarImgRes = foundReq.resLink;
						foundUser.avatarImgSpy = foundReq.spyLink;

						// console.log(foundUser);

						foundUser.save();

						var str = "Your avatar request was approved by " + foundReq.modWhoProcessed + "!";
						if(foundReq.modComment){
							str += " Their comment was: " + foundReq.modComment;
						}

						// createNotifObj.createNotification = function(userIDTarget, stringToSay, link){
						createNotificationObj.createNotification(foundUser._id, str, "#");
					}
					
				});
			}

			else if(req.body.decision === false || req.body.decision === "false"){
				User.findOne({usernameLower: foundReq.forUsername.toLowerCase()}).populate("notifications").exec(function(err, foundUser){
					if(err){console.log(err);}
					else{
						var str = "Your avatar request was rejected by " + foundReq.modWhoProcessed + ".";
						
						str += " Their comment was: " + foundReq.modComment;
						

						// createNotifObj.createNotification = function(userIDTarget, stringToSay, link){
						createNotificationObj.createNotification(foundUser._id, str, "#");
					}
				});
			}
			else{
				console.log("error, decision isnt anything recognisable...: " + req.body.decision);
			}

			foundReq.save();
		}
	});

	// console.log(mongoose.Types.ObjectId(req.query.idOfNotif));

	res.status(200).send("done");
	
});



//Show the customavatar edit page
router.get("/:profileUsername/changeavatar",middleware.checkProfileOwnership, function(req, res){
	User.findOne({usernameLower: req.params.profileUsername.toLowerCase()}, function(err, foundUser){
		if(err){
			console.log(err);
		}
		else{
			res.render("profile/changeavatar", {userData: foundUser});
		}
	});
});

//Update the customavatar
router.post("/:profileUsername/changeavatar",middleware.checkProfileOwnership, function(req, res){

	console.log("Recieved change avatar");
	console.log("For user " + req.params.profileUsername);
	console.log("Res link: " + req.body.reslink);
	console.log("Spy link: " + req.body.spylink);

	//sometimes https links dont show up correctly
	// req.body.reslink.replace("https", "http");
	// req.body.spylink.replace("https", "http");

	var avatarRequestData = {
		forUsername: req.params.profileUsername.toLowerCase(),

		resLink: sanitizeHtml(req.body.reslink),
		spyLink: sanitizeHtml(req.body.spylink),

		dateRequested: new Date(),

		processed: false
	}

	avatarRequest.create(avatarRequestData, function(err, createdRequest){
		if(err){console.log(err);}
		else{
			req.flash("success", "Your submission was received! Please wait for a moderator to process your request.");
			res.redirect("/profile/" + req.params.profileUsername);
		}
	});
});



//show the edit page
router.get("/:profileUsername/edit", middleware.checkProfileOwnership, function(req, res){
	User.findOne({usernameLower: req.params.profileUsername.toLowerCase()}, function(err, foundUser){
		if(err){
			console.log(err);
		}
		else{
			res.render("profile/edit", {userData: foundUser});
		}
	});
});


//update a biography
router.post("/:profileUsername",middleware.checkProfileOwnership , function(req, res){

	console.log("biography update");
	console.log(req.body.biography);
	console.log(req.body.nationality);
	console.log(req.body.nationCode);

	// req.body.nationCode = ["UN", "CA", "AU"];
	// console.log("changed");

	// console.log(req.body.nationCode);
	// console.log(typeof(req.body.nationCode));
	

	if(typeof(req.body.nationCode) === "array" || typeof(req.body.nationCode) === "object"){
		req.body.nationCode = req.body.nationCode[req.body.nationCode.length-1];
	}




	User.find({usernameLower: req.params.profileUsername.toLowerCase()}).populate("notifications").exec(function(err, foundUser){
        foundUser = foundUser[0];

		if(err){
			console.log(err);
		}
		else{
			foundUser.biography = sanitizeHtml(req.body.biography, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
                allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
            });

            foundUser.nationality = sanitizeHtml(req.body.nationality);
            foundUser.nationCode = sanitizeHtml(req.body.nationCode.toLowerCase());

            foundUser.save();

			

			res.redirect("/profile/" + foundUser.username);
		}
	});
});

//show the profile page
router.get("/:profileUsername",middleware.isLoggedIn, function(req, res){
	User.findOne({usernameLower: req.params.profileUsername.toLowerCase()}, function(err, foundUser){
		if(err){
			console.log(err);
		}
		else{
			res.render("profile/profile", {userData: foundUser, personViewingUsername: req.user.username});
		}
	});
});






module.exports = router;