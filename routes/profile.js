var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var sanitizeHtml = require('sanitize-html');
var User 			= require("../models/user");
var mongoose 		= require("mongoose");


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



//show the edit page
router.get("/:profileUsername/edit",middleware.checkProfileOwnership, function(req, res){
	User.findOne({username: req.params.profileUsername}, function(err, foundUser){
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
	if(req.body.nationCode.length > 1){
		req.body.nationCode = req.body.nationCode[0];
	}


	User.find({username: req.params.profileUsername}, function(err, foundUser){
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
	User.findOne({username: req.params.profileUsername}, function(err, foundUser){
		if(err){
			console.log(err);
		}
		else{
			res.render("profile/profile", {userData: foundUser, personViewingUsername: req.user.username});
		}
	});
});






module.exports = router;