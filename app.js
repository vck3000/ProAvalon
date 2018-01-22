//=====================================
//INITIALISATION
//=====================================
var express 		= require("express"),
	app 			= express()
	mongoose		= require("mongoose"),
	bodyParser 		= require("body-parser"),
	methodOverride 	= require("method-override");

var port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("assets"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));


mongoose.connect("mongodb://localhost/TheNewResistanceUsers");






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
	res.send("Post req of the register!");
});

//start server listening
var server = app.listen(port, function(){
	console.log("Server has started!");
});

//=====================================
//SOCKETS
//=====================================