//=====================================
//INITIALISATION
//=====================================
var express = require("express"),
	app = express(),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	User = require("./models/user"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	passportSocketIo = require("passport.socketio"),
	cookieParser = require('cookie-parser'),
	flash = require("connect-flash");
var modAction = require("./models/modAction");

app.use(express.static("assets", { maxAge: 1800000 })); //expires in 30 minutes.	

var staticify = require('staticify')('assets');
app.use(staticify.middleware);

app.locals = {
	getVersionedPath: staticify.getVersionedPath
};

var port = process.env.PORT || 80;
var dbLoc = process.env.DATABASEURL || "mongodb://localhost/TheNewResistanceUsers";
console.log("Using database url: " + dbLoc);

mongoose.connect(dbLoc);

var session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);

var store = new MongoDBStore({
	// uri: 'mongodb://localhost/TheNewResistanceUsers',
	// uri: 'mongodb://127.0.0.1/TheNewResistanceUsers',
	uri: dbLoc,
	collection: 'mySessions'
});


// Catch errors
store.on('error', function (error) {
	assert.ifError(error);
	assert.ok(false);
});


//authentication
var secretKey = process.env.MY_SECRET_KEY || "MySecretKey";
app.use(session({
	secret: secretKey,
	resave: false,
	saveUninitialized: false,
	store: store
}));


app.use(flash());
//res.locals variables
app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	// headerActive default should be nothing, otherwise specify in the routes index.js file
	res.locals.headerActive = " ";
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//HTTPS REDIRECT
var platform = process.env.MY_PLATFORM || "local";
if (platform === "online" || platform === "staging") {
	app.use(function (request, response, next) {
		if (request.headers["x-forwarded-proto"] !== "https") {
			response.redirect("https://" + request.hostname + request.url);
		}
		else {
			next();
		}
	});
}

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

var requireLoggedInRoutes = [
    "/lobby",
    "/forum",
    "/profile"
]

async function checkLoggedIn(req, res, next){
    var banned = undefined;
    for(var i = 0; i < requireLoggedInRoutes.length; i++){
        if(req.originalUrl.startsWith(requireLoggedInRoutes[i]) == true){
            // Check for logged in.
            if(req.isAuthenticated() == false){
                req.flash("error", "Please log in to view this page.");
                res.redirect("/");
                return;
            }

            // Check bans
            await modAction.findOne({"bannedPlayer.usernameLower": req.user.username.toLowerCase()}, function(err, m){
                if(err){
                    console.log(err);
                }
                else{
                    // console.log("A");
                    // console.log(m);
                    if (m == null || m == undefined){
                        // all good
                    }
                    else{
                        var message = "You have been banned. The ban will be released on " + m.whenRelease + ". Ban description: '" + m.descriptionByMod + "'";
                        message += " Reflect on your actions.";
                        req.flash("error", message);
                        res.redirect("/");
                        banned = true;
                        return;
                    }
                }
            });
            // console.log("Logged in!");
        }
    };

    if(banned == true){
        // console.log("banned");
        return;
    }
    next();
}
app.use(checkLoggedIn);


var indexRoutes = require("./routes/index");
app.use(indexRoutes);

var forumRoutes = require("./routes/forum");
app.use("/forum", forumRoutes);

var profileRoutes = require("./routes/profile");
app.use("/profile", profileRoutes);

//start server listening
var IP = process.env.IP || "127.0.0.1";
// var server = app.listen(port, IP , function(){
var server = app.listen(port, function () {
	console.log("Server has started on " + IP + ":" + port + "!");
});


//=====================================
//SOCKETS
//=====================================
var socket = require("socket.io");
var io = socket(server),
	passportSocketIo = require("passport.socketio");

require("./sockets/sockets")(io);

io.use(passportSocketIo.authorize({
	cookieParser: cookieParser, //optional your cookie-parser middleware function. Defaults to require('cookie-parser') 
	// key:          'express.sid',       //make sure is the same as in your session settings in app.js 
	secret: secretKey,      //make sure is the same as in your session settings in app.js 
	store: store,        //you need to use the same sessionStore you defined in the app.use(session({... in app.js 
	// success:      onAuthorizeSuccess,  // *optional* callback on success 
	// fail:         onAuthorizeFail,     // *optional* callback on fail/error 
	passport: passport
}));




// setTimeout(function(){

// 	console.log("Starting gameRecord database fix...");

// 	var gameRecord = require("./models/gameRecord");

// 	gameRecord.find({}).exec(function (err, records) {
// 		// gameRecord.find({}).skip(17000).limit(100).exec(function (err, records) {
// 		if (err) {
// 			console.log(err);
// 		}
// 		else {
// 			console.log(records.length + " games loaded.");

// 			var missingGameMode = 0;
// 			var missingLadyCard = 0;
// 			// var count = 0;
// 			records.forEach(async function(r){
// 				// console.log(r);


// 				if(r.gameMode == undefined){
// 					missingGameMode += 1;
// 					console.log("missing gameMode: " + missingGameMode);
// 					if(missingGameMode % 1000 == 0){
// 						console.log(r);
// 					}

// 					r.gameMode = "avalon";
// 					r.markModified("gameMode");
// 					await r.save();
// 				}

// 				if(r.sireChain.length > 0 && r.cards.includes("sire of the sea") == false){
// 					console.log("Sire");
// 					console.log(r.sireChain + "\t" + r.cards);
// 					console.log(r.timeGameFinished);


// 					r.cards.push("sire of the sea");
// 					r.markModified("cards");
// 					await r.save();
// 				}

// 				if(r.ladyChain.length > 0 && r.cards.includes("lady of the lake") == false){
// 					console.log("Lady");
// 					console.log(r.ladyChain + "\t" + r.cards);
// 					console.log(r.timeGameFinished);

// 					r.cards.push("lady of the lake");
// 					r.markModified("cards");
// 					await r.save();
// 				}

// 				if(r.refChain.length > 0 && r.cards.includes("ref of the rain") == false){
// 					console.log("Ref");
// 					console.log(r.refChain + "\t" + r.cards);
// 					console.log(r.timeGameFinished);
			
// 					r.cards.push("ref of the rain");
// 					r.markModified("cards");
// 					await r.save();
// 				}

// 				// count += 1;
// 				// if(count % 2000 == 0){
// 				// 	console.log(r);
// 				// }
// 			});


// 			console.log("Done!");
// 		}
// 	});
// }, 5000);