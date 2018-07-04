var express 	= require("express");
var router 		= express.Router();
var passport 	= require("passport");
var User 		= require("../models/user");
var flash 		= require("connect-flash");
var sanitizeHtml = require('sanitize-html');

var middleware = require("../middleware");

//Index route
router.get("/", function(req, res){
	res.render("index");
});

//register route
router.get("/register", function(req, res){
	res.render("register");
});

//Post of the register route
router.post("/",sanitiseUsername,/* usernameToLowerCase, */function(req, res){
	// console.log("escaped: " + escapeText(req.body.username));

	// var escapedUsername = escapeText(req.body.username);

	var newUser = new User({username: req.body.username/*.toLowerCase()*/});

	if(req.body.username.indexOf(" ") !== -1){
		req.flash("error", "Sign up failed. Please do not use spaces in your username.");
		res.redirect("register");
	}
	else if(req.body.username.length > 25){
		req.flash("error", "Sign up failed. Please do not use more than 25 characters in your username.");
		res.redirect("register");
	}

	else if(usernameContainsBadCharacter(req.body.username) == true){
		req.flash("error", "Please do not use an illegal character");
		res.redirect("register");
	}

	else{
		User.register(newUser, req.body.password, function(err, user){
			if(err){
				console.log("ERROR: " + err);
				req.flash("error", "Sign up failed. Most likely that username is taken.");
				res.redirect("register");
			} else{
				//successful, get them to log in again
				// req.flash("success", "Sign up successful. Please log in.");
				// res.redirect("/");
				passport.authenticate("local")(req, res, function(){
					res.redirect("/lobby");
				});
			}
		});
	}	
});

//login route
router.post("/login",sanitiseUsername, /*usernameToLowerCase,*/ passport.authenticate("local", {
	successRedirect: "/lobby",
	failureRedirect: "/loginFail"
}));

router.get("/loginFail", function(req, res){
	req.flash("error", "Log in failed! Please try again.");
	res.redirect("/");
});

//lobby route
router.get("/lobby", middleware.isLoggedIn, function(req, res){
	// console.log(res.app.locals.originalUsername);
	res.render("lobby", {currentUser: req.user, headerActive: "lobby"});

});

//logout 
router.get("/logout", function(req, res){
	//doesn't work since we destroy the session right after...
	// req.flash("success", "Logged you out!");
	req.session.destroy(function (err) {
	    res.redirect('/'); //Inside a callback… bulletproof!
	});	
});

router.get("/log", function(req, res){
	res.render("log", {currentUser: req.user, headerActive: "log"});
})

router.get("/rules", function(req, res){
	res.render("rules", {currentUser: req.user, headerActive: "rules"});
})

router.get("/testmodal", function(req, res){
	res.render("testmodal", {currentUser: req.user});
});

//=====================================
//Forum
//=====================================
//this part should be in another file now.
// router.get("/forum", function(req, res){
// 	res.render("forum", {currentUser: req.user});
// })



//=====================================
//MIDDLEWARE
//=====================================
// function isLoggedIn(req, res, next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	console.log("User is not logged in");
// 	res.redirect("/");
// }

// function usernameToLowerCase(req, res, next){
// 	res.app.locals.originalUsername = req.body.username;
// 	req.body.username = req.body.username.toLowerCase();
// 	next();
// }

function escapeTextUsername(req, res, next){
	req.body.username = escapeText(req.body.username);
	next();
}

function sanitiseUsername(req, res, next){
	
	req.body.username = sanitizeHtml(req.body.username, {
		allowedTags: [],
		allowedAttributes: []
	});

	next();
}

module.exports = router;


function usernameContainsBadCharacter(str){
	if(str.includes('&amp;') || 
			str.includes('&lt;') ||
			str.includes('&gt;') ||
			str.includes('&apos;') ||
			str.includes('&quot;')){
		return true;
	}
	else{
		return false;
	}

}


function escapeText(str) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/'/g, '&apos;')
		.replace(/"/g, '&quot;')
		.replace(/(?:\r\n|\r|\n)/g, ' <br>');
};