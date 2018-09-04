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
	flash = require("connect-flash")

var port = process.env.PORT || 80;


// console.log(process.env.DATABASEURL);
// mongoose.connect("mongodb://localhost/TheNewResistanceUsers");
mongoose.connect(process.env.DATABASEURL);

// mongodb://127.0.0.1/TheNewResistanceUsers

//mongodb://<dbuser>:<dbpassword>@ds131698.mlab.com:31698/playavalon

var session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
	// uri: 'mongodb://localhost/TheNewResistanceUsers',
	// uri: 'mongodb://127.0.0.1/TheNewResistanceUsers',
	uri: process.env.DATABASEURL,
	collection: 'mySessions'
});


// Catch errors
store.on('error', function (error) {
	assert.ifError(error);
	assert.ok(false);
});


//authentication
app.use(session({

	secret: process.env.MY_SECRET_KEY,
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
// console.log("b");
// console.log(process.env.MY_PLATFORM);
if(process.env.MY_PLATFORM === "online" || process.env.MY_PLATFORM === "staging"){
	app.use(function(request, response, next){
		// console.log("A");
		if(request.headers["x-forwarded-proto"] !== "https"){
			// console.log("redirect to https");
			// console.log(request.headers.host);
			// console.log(request.hostname);

			// console.log(request.url);
	
			// console.log("https://" + request.hostname + request.url)
	
			response.redirect("https://" + request.hostname + request.url);
		}
		else{
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
//if the production site, then use a cache that lasts for 30 mins.
if(process.env.MY_PLATFORM === "online"){
	app.use(express.static("assets", {maxAge: 1800000})); //expires in 30 minutes.
}
else{
	app.use(express.static("assets")); //expires in 30 minutes.	
}
// var path = require('path'); 
// app.use(express.static(path.join(__dirname, 'assets'), { maxAge: '2 days' }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));



var indexRoutes = require("./routes/index");
app.use(indexRoutes);

var forumRoutes = require("./routes/forum");
app.use("/forum", forumRoutes);

var profileRoutes = require("./routes/profile");
app.use("/profile", profileRoutes);






// seedDB();

//start server listening
var IP = process.env.IP || "192.168.1.66";
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
	secret: process.env.MY_SECRET_KEY,      //make sure is the same as in your session settings in app.js 
	store: store,        //you need to use the same sessionStore you defined in the app.use(session({... in app.js 
	// success:      onAuthorizeSuccess,  // *optional* callback on success 
	// fail:         onAuthorizeFail,     // *optional* callback on fail/error 
	passport: passport
}));


//REMOVE THIS SOON AFTER UPLOADING TO SERVER ONCE
// User.find({}).populate("notifications").exec(function(err, foundUsers){
// 	// for(var i = 0; i < foundUsers.length; i++){
// 	// 	console.log(foundUsers.username);
// 	// }
// 	console.log(typeof(foundUsers));
// 	for(var key in foundUsers){
// 		if(foundUsers.hasOwnProperty(key)){
// 			console.log(foundUsers[key].username);
// 			console.log("key: " + key);

// 			foundUsers[key].usernameLower = foundUsers[key].username.toLowerCase();
// 			foundUsers[key].save();
// 		}
// 	}
// });

// if(process.env.MY_PLATFORM === "local"){
// 	var testRoleStats = {
// 		"5p": {
// 			"merlin": {
// 				"wins": 2
// 			},
// 			"percival": {
// 				"losses": 2
// 			},
// 			"assassin": {
// 				"losses": 1
// 			},
// 			"morgana": {
// 				"losses": 2
// 			},
// 			"spy": {},
// 			"resistance": {
// 				"losses": 2,
// 				"wins": 1
// 			}
// 		},
// 		"8p": {
// 			"spy": {
// 				"wins": 1,
// 				"losses": 0
// 			},
// 			"assassin": {
// 				"wins": 1,
// 				"losses": 0
// 			}
// 		},
// 		"7p": {
// 			"resistance": {
// 				"wins": 1,
// 				"losses": 0
// 			},
// 			"merlin": {
// 				"wins": 0,
// 				"losses": 1
// 			}
// 		},
// 		"6p": {
// 			"resistance": {
// 				"wins": 3,
// 				"losses": 1
// 			},
// 			"merlin": {
// 				"wins": 1,
// 				"losses": 0
// 			},
// 			"assassin": {
// 				"wins": 1,
// 				"losses": 1
// 			},
// 			"morgana": {
// 				"wins": 0,
// 				"losses": 2
// 			}
// 		}
// 	};
// 	var User 			= require("./models/user");
// 	User.findOne({username: "123"}).exec(function(err, foundUser){
// 		foundUser.roleStats = testRoleStats;
// 		foundUser.save();
// 		console.log("test");
// 	});
// }


//RESTORING THE TOTAL GAMETIME PLAYED. REMOVE THIS SECTION AFTER ONE UPLOAD TO THE SERVER!!
//but if u dont remove it its still ok, doesn't break anything. itll just update every time it restarts

// var gameRecord = require("./models/gameRecord");




// var peopleTotalTime = {};
// var arrayUsernamesTimePlayed = [];
// 		var arrayTimePlayed = [];

// gameRecord.find({}, function(err, gameRecords){
// 	if(err){console.log(err);}
// 	else{
// 		console.log("c");
// 		gameRecords.forEach(function(record){
// 			var gameDuration = new Date(record.timeGameFinished.getTime() - record.timeGameStarted.getTime());
	
// 			console.log("Duration: ");
// 			console.log(gameDuration);
// 			console.log("Duration getTime: ");
// 			console.log(gameDuration.getTime());
	
// 			record.spyTeam.forEach(function(spyPlayer){
// 				if(!peopleTotalTime[spyPlayer.toLowerCase()]){
// 					peopleTotalTime[spyPlayer.toLowerCase()] = new Date(gameDuration.getTime());
// 				}
// 				else{
// 					peopleTotalTime[spyPlayer.toLowerCase()] = new Date(peopleTotalTime[spyPlayer.toLowerCase()].getTime() + gameDuration.getTime());
// 				}
// 			});

// 			record.resistanceTeam.forEach(function(resPlayer){
// 				if(!peopleTotalTime[resPlayer.toLowerCase()]){
// 					peopleTotalTime[resPlayer.toLowerCase()] = new Date(gameDuration.getTime());
// 				}
// 				else{
// 					peopleTotalTime[resPlayer.toLowerCase()] = new Date(peopleTotalTime[resPlayer.toLowerCase()].getTime() + gameDuration.getTime());
// 				}
// 			});
// 		});


		

// 		for(var key in peopleTotalTime){
// 			if(peopleTotalTime.hasOwnProperty(key)){
// 				// console.log("key");
// 				// console.log(key);

// 				// if(key === 'hakha3'){

// 				arrayUsernamesTimePlayed.push(key);
// 				arrayTimePlayed.push(peopleTotalTime[key]);
// 			}
// 		}


// 		// for(var i = 0; i < arrayUsernamesTimePlayed.length; i++){
// 		// 	User.findOne({usernameLower: arrayUsernamesTimePlayed[i]}).populate("notifications").exec(async function(err, user){
// 		// 		if(err){console.log(err);}
// 		// 		else{
// 		// 			// console.log(arrayUsernamesTimePlayed[i]);
// 		// 			// console.log("time played: ");
// 		// 			// console.log(arrayTimePlayed[i]);
// 		// 			console.log(i);
// 		// 			// user.totalTimePlayed = arrayTimePlayed[i];
// 		// 			// user.save();
// 		// 		}
// 		// 	});
// 		// }
// 		console.log("DONE: ");
// 		console.log(arrayUsernamesTimePlayed);
// 		console.log(arrayTimePlayed);

// 		nextTest(0);

// 	}
// });


// function nextTest(i){
// 	if(i === arrayUsernamesTimePlayed.length){
// 		return;
// 	}
// 	User.findOne({usernameLower: arrayUsernamesTimePlayed[i]}).populate("notifications").exec(async function(err, user){
// 		if(err){console.log(err);}
// 		else{
// 			console.log(arrayUsernamesTimePlayed[i]);
// 			console.log("time played: ");
// 			console.log(arrayTimePlayed[i]);
// 			console.log(i);
// 			user.totalTimePlayed = arrayTimePlayed[i];
// 			user.save();
// 			nextTest(i+1);
// 		}
// 	});
// }








//=====================================
//MIDDLEWARE
//=====================================
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	// console.log("User is not logged in");
	res.redirect("/");
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