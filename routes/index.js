var express 	= require("express");
var router 		= express.Router();
var passport 	= require("passport");
var User 		= require("../models/user");
var flash 		= require("connect-flash");

//Index route
router.get("/", function(req, res){
	res.render("index");
});

//register route
router.get("/register", function(req, res){
	res.render("register");
});

//Post of the register route
router.post("/", usernameToLowerCase, function(req, res){
	var newUser = new User({username: req.body.username});

	if(req.body.username.indexOf(" ") !== -1){
		req.flash("error", "Sign up failed. Please do not use spaces in your username." + req.body.username.indexOf(" "));
		res.redirect("register");
	}
	else{
		User.register(newUser, req.body.password, function(err, user){
			if(err){
				console.log("ERROR: " + err);
				req.flash("error", "Sign up failed. Most likely that username is taken.");
				res.redirect("register");
			} else{
				passport.authenticate("local")(req, res, function(){
					res.redirect("/lobby");
				});
			}
		});
	}	
});

//login route
router.post("/login", usernameToLowerCase, passport.authenticate("local", {
	successRedirect: "/lobby",
	failureRedirect: "/loginFail"
}));

router.get("/loginFail", function(req, res){
	req.flash("error", "Log in failed! Please try again :)");
	res.redirect("/");
});

//lobby route
router.get("/lobby", isLoggedIn, function(req, res){
	console.log(res.app.locals.originalUsername);
	res.render("lobby", {currentUser: res.app.locals.originalUsername, headerActive: "lobby"});
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
router.get("/forum", function(req, res){
	res.render("forum", {currentUser: req.user});
})



//=====================================
//MIDDLEWARE
//=====================================
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	console.log("User is not logged in");
	res.redirect("/");
}

function usernameToLowerCase(req, res, next){
	res.app.locals.originalUsername = req.body.username;
	req.body.username = req.body.username.toLowerCase();
	next();
}




module.exports = router;