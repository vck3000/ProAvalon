var express = require("express");
var router = express.Router();
var forumThread = require("../models/forumThread");
var forumThreadComment = require("../models/forumThreadComment");
var lastIds = require("../models/lastIds");


var middleware = require("../middleware");


router.get("/", function (req, res) {
	//rendering the campgrounds.ejs file
	//and also passing in the array data
	//first campgrounds is the name of the obj we are passing
	//the second one is the data from the above array we are providing
	// res.render("campgrounds", {campgrounds: campgrounds});


	//get all forumThreads from DB
	//then render
	forumThread.find({}).sort({ timeCreated: 'descending' }).exec(function (err, allForumThreads) {
		if (err) {
			console.log(err);
		}
		else {
			//only send back the first 10 entries
			res.render("forum/index", { allForumThreads: allForumThreads.slice(0, 10), currentUser: res.app.locals.originalUsername });
		}
	});
});

router.post("/", middleware.isLoggedIn, async function (req, res) {
	const util = require('util')

	console.log("inc data: " + util.inspect(req.body, { showHidden: false, depth: null }))

	// console.log("inc data: " + req.body);

	//get data from form and add to campgrounds array
	var title = req.body.title;
	var description = req.body.description;

	var d = new Date();

	var timeCreated = d;

	var likes = 0;
	var numOfComments = 0;
	var timeLastEdit = d;

	var hoursSinceLastEdit = 0;

	var author = {
		id: req.user._id,
		username: res.app.locals.originalUsername
	}

	var comments = [];

	var category = "";
	if (req.body.avalon) {
		category = "avalon";
	}
	else if (req.body.offTopic) {
		category = "offTopic";
	}
	else if (req.body.suggestion) {
		category = "suggestion";
	}
	else if (req.body.bug) {
		category = "bug";
	}

	var number = 0;
	await lastIds.findOne({}).exec(async function (err, returnedLastId) {
		console.log(returnedLastId.number);

		number = returnedLastId.number;
		returnedLastId.number++;

		await returnedLastId.save();


		var newForumThread = {
			title: title,
			description: description,

			hoursSinceLastEdit: hoursSinceLastEdit,
			timeCreated: timeCreated,

			likes: likes,
			numOfComments: numOfComments,
			timeLastEdit: timeLastEdit,

			author: author,
			comments: comments,
			category: category,
			numberId: number
		};

		//create a new campground and save to DB
		forumThread.create(newForumThread, function (err, newlyCreated) {
			if (err) {
				console.log(err);
			}
			else {
				//redirect back to campgrounds page
				res.redirect("/forum");
			}
		});


	});

	//PUT IT ALL TOGETHER


});

//this route should be above the :id one because of
//order
router.get("/new", middleware.isLoggedIn, function (req, res) {
	// console.log("NEW STUFF ");
	res.render("forum/new");
});

//show
router.get("/:id", function (req, res) {
	forumThread.findById(req.params.id).populate("comments").exec(function (err, foundForumThread) {
		if (err) {
			// console.log(err);
			console.log("Thread not found, redirecting");
			res.redirect("/forum");
		}
		else {
			if (foundForumThread === null) {
				console.log("Thread not found, redirecting");
				res.redirect("/forum");
			}
			console.log("comments: " + forumThread.comments);
			res.render("forum/show", { forumThread: foundForumThread });
		}
	});
});


//EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
	Campground.findById(req.params.id, function (err, foundCampground) {
		res.render("campgrounds/edit", { campground: foundCampground });
	});
});

//update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
	//find and update the correct campground

	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	//redirect to show page
});

//destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
	Campground.findByIdAndRemove(req.params.id, function (err) {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});





module.exports = router;