var express 	= require("express");
var router 		= express.Router();
var forumThread = require("../models/forumThread");
var middleware	= require("../middleware");

router.get("/", function(req, res){
	//rendering the campgrounds.ejs file
	//and also passing in the array data
	//first campgrounds is the name of the obj we are passing
	//the second one is the data from the above array we are providing
	// res.render("campgrounds", {campgrounds: campgrounds});


	//get all campgrounds from DB
	//then render
    
    
    // forumThread.find({/*Looking for everything so this is empty*/},
	// function(err, allForumThreads/*allForumThreads is what came back from the find*/){
	// 	if(err){
	// 		console.log(err);
	// 	}
	// 	else{
	// 		res.render("forum/index", {campgrounds: allForumThreads, currentUser: req.user.username});
	// 	}
    // });
    
    res.render("forum/index", {currentUser: res.app.locals.originalUsername});
});

router.post("/", middleware.isLoggedIn, function(req, res){
	//get data from form and add to campgrounds array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var id = req.user._id;
	var username = req.user.username;

	var newCampground = {name: name,price: price, image: image, 
		description: description, author: {id, username}};

	//create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			//redirect back to campgrounds page
			res.redirect("/campgrounds");
		}
	});
	// campgrounds.push(newCampground);
});

//this route should be above the :id one because of
//order
router.get("/new", middleware.isLoggedIn, function(req, res){
    console.log("NEW STUFF ");
	res.render("forum/new");
});

//show
router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});


//EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	//find and update the correct campground

	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	//redirect to show page
});

//destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else{
			res.redirect("/campgrounds");
		}
	});
});





module.exports = router;