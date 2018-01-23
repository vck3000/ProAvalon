//=====================================
//INITIALISATION
//=====================================
var express 		= require("express"),
	app 			= express()
	mongoose		= require("mongoose"),
	bodyParser 		= require("body-parser"),
	methodOverride 	= require("method-override"),

	User 			= require("./models/user"),

	passport		= require("passport"),
	LocalStrategy	= require("passport-local"),
	passportSocketIo = require("passport.socketio");

var port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost/TheNewResistanceUsers");


//authentication
app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");
app.use(express.static("assets"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//res.locals variables
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	// res.locals.error = req.flash("error");
	// res.locals.success = req.flash("success");
	next();
});






//=====================================
//ROUTES
//=====================================

//Index route
app.get("/", function(req, res){
	res.render("index");
});

//register route
app.get("/register", function(req, res){
	res.render("register");
});

//Post of the register route
app.post("/", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log("ERROR: " + err);
			res.redirect("register");
		} else{
			passport.authenticate("local")(req, res, function(){
				res.redirect("/lobby");
			});
		}
	});
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/lobby",
	failureRedirect: "/"
}), function(req, res){
	res.send("LOGIN LOGIC");
});

// app.post("/login", function(req, res){
// 	res.send("post of login");
// });


 
app.get("/lobby", isLoggedIn, function(req, res){
	console.log(req.user);
	res.render("lobby", {currentUser: req.user});
});

//start server listening
var server = app.listen(port, function(){
	console.log("Server has started!");
});

//=====================================
//SOCKETS
//=====================================
var socket = require("socket.io");
var io = socket(server);

io.sockets.on("connection", function(socket){
	console.log("A new user has connected under socket ID: " + socket.id);

	//automatically join the all chat
	socket.join("allChat");

	
	socket.on("allChatFromClient", function(data){
		console.log("incoming message at " + data.date + ": " + data.message);
		// if()
		data.username = res.locals.currentUser;
		socket.in("allChat").broadcast.emit("allChatToClient", data);
	});

	

	socket.on("newRoom", function(data){
		var room = new Room(currentUser);

		socket.in("allChat").emit("Room " + room.ID + " has been created! Go join!");
	});




});


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