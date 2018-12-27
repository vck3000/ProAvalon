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

app.use(express.static("assets", { maxAge: 1800000 })); //expires in 30 minutes.	

var path = require('path');
// var staticify = require('staticify')(path.join(__dirname, 'assets'));
var staticify = require('staticify')('assets');
app.use(staticify.middleware);

app.locals = {
	getVersionedPath: staticify.getVersionedPath
};


var port = process.env.PORT || 80;
var dbLoc = process.env.DATABASEURL || "mongodb://localhost/TheNewResistanceUsers";

// console.log(process.env.DATABASEURL);
// mongoose.connect("mongodb://localhost/TheNewResistanceUsers");
mongoose.connect(dbLoc);

// mongodb://127.0.0.1/TheNewResistanceUsers

//mongodb://<dbuser>:<dbpassword>@ds131698.mlab.com:31698/playavalon

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
// console.log("b");
// console.log(process.env.MY_PLATFORM);
var platform = process.env.MY_PLATFORM || "local";
if (platform === "online" || platform === "staging") {
	app.use(function (request, response, next) {
		// console.log("A");
		if (request.headers["x-forwarded-proto"] !== "https") {
			// console.log("redirect to https");
			// console.log(request.headers.host);
			// console.log(request.hostname);

			// console.log(request.url);

			// console.log("https://" + request.hostname + request.url)

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



var indexRoutes = require("./routes/index");
app.use(indexRoutes);

var forumRoutes = require("./routes/forum");
app.use("/forum", forumRoutes);

var profileRoutes = require("./routes/profile");
app.use("/profile", profileRoutes);






// seedDB();

//start server listening
var IP = process.env.IP || "127.0.0.1";
// IP = "127.0.0.1";
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



// var query = { 
// 	$or: [
//         {
//             _id: "5b8d71eebe34c50014c9ac08"
//         },
//         {
//             _id: "5b5df4b9a694130014ee4c0e"
//         },
//         {
//             _id: "5be74d1dd2cfc00014637590"
//         },
//         {
//             _id: "5bbb7dc9cdf89b0013e67921"
//         },
//         {
//             _id: "5b9434435b07de00147414e6"
//         },
//         {
//             _id: "5b98e045635d0e00142bd2e7"
//         },
//         {
//             _id: "5b9435b55b07de00147414ec"
//         },
//         {
//             _id: "5bf6ea908954ee0014835c90"
//         },
//         {
//             _id: "5bd194a1b4fc8d0013e98956"
//         },
//         {
//             _id: "5b6bed7a2264bd001497c215"
//         },
//         {
//             _id: "5b8503f5f318140014a82d4e"
//         },
//         {
//             _id: "5b5845a925e03c0014cab279"
//         },
//         {
//             _id: "5beb0cff7531ec001453290a"
//         },
//         {
//             _id: "5bec649055fb47001438be89"
//         },
//         {
//             _id: "5b75cced3f4e0500147bbfe0"
//         },
//         {
//             _id: "5bd3503b7c22ed0013bcf51f"
//         },
//         {
//             _id: "5b685e804cf1770014db3144"
//         },
//         {
//             _id: "5bf17c576b740e0014444227"
//         },
//         {
//             _id: "5b74e17983d07b001499d790"
//         },
//         {
//             _id: "5b8d88d2be34c50014c9ac16"
//         },
//         {
//             _id: "5b8b031a1e9e7f0014cf14e0"
//         },
//         {
//             _id: "5b8af5ea1e9e7f0014cf14d2"
//         },
//         {
//             _id: "5b9286c12dbc950014c647ac"
//         },
//         {
//             _id: "5b58b314f0c4670014ca6c3b"
//         },
//         {
//             _id: "5bf9709a8e40f30014c2ff18"
//         },
//         {
//             _id: "5b5a2c95c3d9730014bbb446"
//         },
//         {
//             _id: "5b58b5ecf0c4670014ca6c3d"
//         },
//         {
//             _id: "5b6ceff339802f00146c4ccf"
//         },
//         {
//             _id: "5b96b43bee816c0014e3d179"
//         },
//         {
//             _id: "5bb8ffd456347200131c2efc"
//         },
//         {
//             _id: "5b7747bffbf77c0014849374"
//         },
//         {
//             _id: "5b5cd0836d73170014297af0"
//         },
//         {
//             _id: "5b5ba9f9d778360014790c91"
//         },
//         {
//             _id: "5b64dcfed2a0660014abfa5e"
//         },
//         {
//             _id: "5b80867886e88f00146568ac"
//         },
//         {
//             _id: "5bb3eb0ab52b51001375721c"
//         },
//         {
//             _id: "5b9d433dcc74270014ddc61c"
//         },
//         {
//             _id: "5bfb47fc6fabf300145ad361"
//         },
//         {
//             _id: "5bff31a3bcdca00014d87df8"
//         },
//         {
//             _id: "5b7b2babc3f814001441240a"
//         },
//         {
//             _id: "5b59f3b5c3d9730014bbb427"
//         },
//         {
//             _id: "5c03601b7a671e0014c669e3"
//         },
//         {
//             _id: "5bee371e6c57a7001494045e"
//         },
//         {
//             _id: "5c040f884ac9820014a1cc09"
//         },
//         {
//             _id: "5c058e65a936b50014b24858"
//         },
//         {
//             _id: "5c05b32fa936b50014b24879"
//         },
//         {
//             _id: "5c05b3f5a936b50014b2487d"
//         },
//         {
//             _id: "5c05b4d7a936b50014b24883"
//         },
//         {
//             _id: "5c05b53ca936b50014b2488b"
//         },
//         {
//             _id: "5c05b604a936b50014b248a3"
//         },
//         {
//             _id: "5c05c1e2ec12dc0014c6aafc"
//         },
//         {
//             _id: "5c05c2ebec12dc0014c6ab25"
//         }
//     ]
// };

// setTimeout(function(){

// 	console.log("test");
// 	User.find(query).then(function(foundUsers){

// 			for(var i = 0; i < foundUsers.length; i++){
// 				console.log(foundUsers[i].username);
// 			}

// 	});

// }, 3000);


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

// if(platform === "local"){
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
