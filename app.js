//=====================================
//INITIALISATION
//=====================================
var express 		= require("express"),
	app 			= express();

var port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("assets"));


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

});

//start server listening
var server = app.listen(port, function(){
	console.log("Server has started!");
});

//=====================================
//SOCKETS
//=====================================