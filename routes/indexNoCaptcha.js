var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var myNotification = require("../models/notification");
var flash = require("connect-flash");
var sanitizeHtml = require("sanitize-html");
var mongoose = require("mongoose");

var modAction = require("../models/modAction");


var middleware = require("../middleware");




//Index route
router.get("/", function (req, res) {
    res.render("index");
});

//register route
router.get("/register", function (req, res) {
    res.render("register");
});

//Post of the register route
router.post("/", sanitiseUsername,/* usernameToLowerCase, */function (req, res) {
    // console.log("escaped: " + escapeText(req.body.username));

    // var escapedUsername = escapeText(req.body.username);

    var newUser = new User({
        username: req.body.username,
        dateJoined: new Date()
    });

    //set default values
    for (var key in defaultValuesForUser) {
        if (defaultValuesForUser.hasOwnProperty(key)) {
            newUser[key] = defaultValuesForUser[key];
        }
    }

    if (req.body.username.indexOf(" ") !== -1) {
        req.flash("error", "Sign up failed. Please do not use spaces in your username.");
        res.redirect("register");
    }
    else if (req.body.username.length > 25) {
        req.flash("error", "Sign up failed. Please do not use more than 25 characters in your username.");
        res.redirect("register");
    }

    else if (usernameContainsBadCharacter(req.body.username)) {
        req.flash("error", "Please do not use an illegal character");
        res.redirect("register");
    }

    else {
        User.register(newUser, req.body.password, function (err, user) {
            if (err) {
                console.log("ERROR: " + err);
                req.flash("error", "Sign up failed. Most likely that username is taken.");
                res.redirect("register");
            } else {
                //successful, get them to log in again
                // req.flash("success", "Sign up successful. Please log in.");
                // res.redirect("/");
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/lobby");
                });
            }
        });
    }
});

//login route
router.post("/login", sanitiseUsername, /*usernameToLowerCase,*/ passport.authenticate("local", {
    successRedirect: "/lobby",
    failureRedirect: "/loginFail"
}));

router.get("/loginFail", function (req, res) {
    req.flash("error", "Log in failed! Please try again.");
    res.redirect("/");
});




//lobby route
router.get("/lobby", middleware.isLoggedIn, async function (req, res) {

    // console.log(res.app.locals.originalUsername);
    User.findOne({ username: req.user.username }).populate("notifications").exec(async function (err, foundUser) {
        if (err) {
            // res.render("lobby", {currentUser: req.user, headerActive: "lobby", userNotifications: [{text: "There was a problem loading your notifications.", optionsCog: true}] });
            console.log(err);
            req.flash("error", "Something has gone wrong! Please contact a moderator or admin.");
            res.redirect("/");
        }
        else {

            currentModActions = [];
            //load up all the modActions that are not released yet and are bans
            await modAction.find({ whenRelease: { $gt: new Date() }, type: "ban" }, function (err, allModActions) {

                for (var i = 0; i < allModActions.length; i++) {
                    currentModActions.push(allModActions[i]);
                }
                // console.log("bans:");
                // console.log(currentModActions);
                // console.log("a");
            });

            // console.log("b");

            for (var i = 0; i < currentModActions.length; i++) {
                if (req.user.id.toString() === currentModActions[i].bannedPlayer.id.toString()) {
                    if (currentModActions[i].type === "ban") {
                        var message = "You have been banned. The ban will be released on " + currentModActions[i].whenRelease + ". Ban description: '" + currentModActions[i].descriptionByMod + "'";
                        message += " Reflect on your actions.";
                        req.flash("error", message);
                        res.redirect("/");

                        console.log(req.user.username + " is still banned and cannot join the lobby.");
                        return;
                    }
                }
            }

            // console.log("c");


            res.render("lobby", { currentUser: req.user, headerActive: "lobby", userNotifications: foundUser.notifications, optionsCog: true });

            //check that they have all the default values.
            for (var keys in defaultValuesForUser) {
                if (defaultValuesForUser.hasOwnProperty(keys)) {
                    //if they don't have a default value, then give them a default value.
                    if (!foundUser[keys]) {
                        foundUser[keys] = defaultValuesForUser[keys];
                    }
                }
            }
            foundUser.save();

        }

    });
});






//logout 
router.get("/logout", function (req, res) {
    //doesn't work since we destroy the session right after...
    // req.flash("success", "Logged you out!");
    req.session.destroy(function (err) {
        res.redirect("/"); //Inside a callback… bulletproof!
    });
});

router.get("/log", function (req, res) {
    res.render("log", { currentUser: req.user, headerActive: "log", path: "log" });
});

router.get("/rules", function (req, res) {
    res.render("rules", { currentUser: req.user, headerActive: "rules" });
});

router.get("/testmodal", function (req, res) {
    res.render("testmodal", { currentUser: req.user });
});

router.get("/about", function (req, res) {
    res.render("about", { currentUser: req.user, headerActive: "about" });
});

router.get("/security", function (req, res) {
    res.render("security", { currentUser: req.user });
});


router.get("/ajax/profile/getProfileData/:profileUsername", function (req, res) {
    User.findOne({ username: req.params.profileUsername }, function (err, foundUser) {
        if (err) {
            console.log(err);
            res.status(200).send("error");

        }
        else {
            res.status(200).send(foundUser);

            console.log("Received AJAX request");
        }
    });
});



router.get("/ajax/seenNotification", function (req, res) {
    console.log("seen nofication");
    console.log(req.query.idOfNotif);


    // console.log(mongoose.Types.ObjectId(req.query.idOfNotif));

    myNotification.findById(mongoose.Types.ObjectId(req.query.idOfNotif), function (err, notif) {
        if (err) {
            console.log(err);
        }

        notif.seen = true;
        var promiseReturned = notif.save();

        promiseReturned.then(function () {
            User.findOne({ username: req.user.username }).populate("notifications").exec(async function (err, foundUser) {

                foundUser.markModified("notifications");
                await foundUser.save();

            });
        });
    });

    res.status(200).send("done");

});


router.get("/ajax/hideNotification", function (req, res) {
    console.log("hide nofication");
    console.log(req.query.idOfNotif);


    // console.log(mongoose.Types.ObjectId(req.query.idOfNotif));

    myNotification.findByIdAndRemove(mongoose.Types.ObjectId(req.query.idOfNotif), function (err) {
        if (err) {
            console.log(err);
        }

        User.findOne({ username: req.user.username }).populate("notifications").exec(async function (err, foundUser) {

            foundUser.markModified("notifications");
            await foundUser.save();

        });
    });

    res.status(200).send("done");

});

router.get("/ajax/hideAllNotifications", function (req, res) {
    console.log("hide all nofications");

    User.findById(req.user._id).populate("notifications").exec(async function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        // console.log(foundUser.notifications);

        foundUser.notifications.forEach(function (notif) {
            console.log("removing notif");
            console.log(notif);
            myNotification.findByIdAndRemove(notif._id, function (err) {
                // console.log("callback");
            });
        });

        foundUser.notifications = [];

        foundUser.markModified("notifications");
        foundUser.save();

    });
    res.status(200).send("done");
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

function escapeTextUsername(req, res, next) {
    req.body.username = escapeText(req.body.username);
    next();
}

function sanitiseUsername(req, res, next) {

    req.body.username = sanitizeHtml(req.body.username, {
        allowedTags: [],
        allowedAttributes: []
    });

    next();
}

module.exports = router;


function usernameContainsBadCharacter(str) {
    if (str.includes("&amp;") ||
		str.includes("&lt;") ||
		str.includes("&gt;") ||
		str.includes("&apos;") ||
		str.includes("&quot;") ||
		str.includes("[") ||
		str.includes("]")) {
        return true;
    }
    else {
        return false;
    }

}


function escapeText(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/'/g, "&apos;")
        .replace(/"/g, "&quot;")
        .replace(/(?:\r\n|\r|\n)/g, " <br>");
}


var defaultValuesForUser = {
    avatarImgRes: null,
    avatarImgSpy: null,

    totalTimePlayed: 0,
    totalGamesPlayed: 0,

    totalWins: 0,
    totalResWins: 0,
    totalLosses: 0,
    totalResLosses: 0,

    winsLossesGameSizeBreakdown: {},

    nationality: "",
    timeZone: "",
    biography: "",

    roleStats: {
        "5p": {
            "merlin": {

            },
            "percival": {

            },
            "assassin": {

            },
            "morgana": {

            },
            "spy": {

            },
            "resistance": {

            }
        }
    },
    notificationS: {}
};