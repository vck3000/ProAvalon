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
	flash = require("connect-flash"),

	seedDB = require("./seeds");

var port = process.env.PORT || 80;


// console.log(process.env.DATABASEURL);
// mongoose.connect("mongodb://localhost/TheNewResistanceUsers");
mongoose.connect(process.env.DATABASEURL);


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
if(process.env.MY_PLATFORM === "online"){
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
app.use(express.static("assets"));
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







//=====================================
//MIDDLEWARE
//=====================================
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	console.log("User is not logged in");
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