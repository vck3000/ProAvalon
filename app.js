var express 		= require("express"),
	app 			= express();

var port = process.env.PORT || 3000;

app.set("view engine", "ejs");


app.get("/", function(req, res){
	res.render("index");
});

var server = app.listen(port, function(){
	console.log("Server has started!");
});