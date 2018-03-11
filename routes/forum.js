var express = require("express");
var router = express.Router();
var forumThread = require("../models/forumThread");
var forumThreadComment = require("../models/forumThreadComment");
var lastIds = require("../models/lastIds");


var middleware = require("../middleware");

router.get("/", function (req, res) {
	res.redirect("/forum/page/1");
})


router.get("/page/:pageNum", function (req, res) {
	//rendering the campgrounds.ejs file
	//and also passing in the array data
	//first campgrounds is the name of the obj we are passing
	//the second one is the data from the above array we are providing
	// res.render("campgrounds", {campgrounds: campgrounds});

	//if theres an invalid page num, redirect to page 1
	if (req.params.pageNum < 1) {
		res.redirect("/forum/page/1");
	}

	//get all forumThreads from DB
	//then render

	var NUM_OF_RESULTS_PER_PAGE = 10;
	if (req.params.numOfResultsPerPage) {
		NUM_OF_RESULTS_PER_PAGE = req.params.numOfResultsPerPage;
	}

	var skipNumber = 0;

	//if we have a specified pageNum, then skip a bit
	if (req.params.pageNum) {
		//-1 because page numbers start at 1
		skipNumber = (req.params.pageNum - 1) * NUM_OF_RESULTS_PER_PAGE;
	}

	forumThread.find({}).sort({ timeCreated: 'descending' }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
		.exec(function (err, allForumThreads) {
			if (err) {
				console.log(err);
			}
			else {

				allForumThreads.forEach(function (forumThread) {

					forumThread.timeSinceString = getTimeDiffInString(forumThread.timeLastEdit);
					// console.log()

				});

				res.render("forum/index", {
					allForumThreads: allForumThreads,
					currentUser: { username: res.app.locals.originalUsername, id: req.user._id },
					pageNum: req.params.pageNum
				});
			}
		});
});

//creating new forumThread
router.post("/", middleware.isLoggedIn, async function (req, res) {
	const util = require('util')

	// console.log("inc data: " + util.inspect(req.body, { showHidden: false, depth: null }))

	// console.log("inc data: " + req.body);

	//get data from form and add to forumThread array
	var title = req.body.title;
	var description = req.body.description;

	var d1 = new Date();
	var d2 = new Date();

	var timeCreated = d1;

	var likes = 0;
	var numOfComments = 0;
	var timeLastEdit = d2;

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
	else{
		category = "offTopic";
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
router.get("/show/:id", function (req, res) {
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

				return;
			}

			//update the time since string for forumThread
			var timeSince = getTimeDiffInString(foundForumThread.timeLastEdit);
			foundForumThread.timeSinceString = timeSince;

			//update the time since string for each comment
			foundForumThread.comments.forEach(function (comment) {
				comment.timeSinceString = getTimeDiffInString(comment.timeLastEdit);
			});

			console.log("comments: " + foundForumThread.comments);

			res.render("forum/show", { forumThread: foundForumThread, currentUser: { username: res.app.locals.originalUsername, id: req.user._id } });
		}
	});
});


//EDIT forumThread route
router.get("/:id/edit", middleware.checkForumThreadOwnership, function (req, res) {
	forumThread.findById(req.params.id, function (err, foundForumThread) {
		res.render("forum/edit", { forumThread: foundForumThread });
	});
});

//update campground route
router.put("/:id", middleware.checkForumThreadOwnership, function (req, res) {
	//find and update the correct campground

	var category = "";
	if (req.body.avalon) {
		category = "avalon";

		//update the category
		req.body.forumThread.category = category;
	}
	else if (req.body.offTopic) {
		category = "offTopic";

		//update the category
		req.body.forumThread.category = category;
	}
	else if (req.body.suggestion) {
		category = "suggestion";

		//update the category
		req.body.forumThread.category = category;
	}
	else if (req.body.bug) {
		category = "bug";

		//update the category
		req.body.forumThread.category = category;
	}



	forumThread.findByIdAndUpdate(req.params.id, req.body.forumThread, function (err, updatedForumThread) {
		if (err) {
			res.redirect("/forum");
		} else {
			res.redirect("/forum/show/" + updatedForumThread.id);
		}
	});
	//redirect to show page
});

//destroy campground route
// router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
// 	Campground.findByIdAndRemove(req.params.id, function (err) {
// 		if (err) {
// 			res.redirect("/campgrounds");
// 		} else {
// 			res.redirect("/campgrounds");
// 		}
// 	});
// });


function getTimeDiffInString(inputTime) {

	var currentDate = new Date();
	var dateDifference = new Date(currentDate - inputTime);

	//set it to seconds
	var timeSince = (dateDifference / 1000);

	console.log(timeSince);
	if (timeSince < 60) {
		timeSince = Math.floor(timeSince) + " seconds";
	}
	else if (timeSince / 60 < 60) {
		timeSince = Math.floor(timeSince / 60) + " mins";
	}
	else if (timeSince / 60 / 60 < 24) {
		timeSince = Math.floor(timeSince / 60 / 60) + " hours";
	}
	else if (timeSince / 60 / 60 / 24 < 30) {
		timeSince = (Math.floor(timeSince / 60 / 60 / 24)) + " days";
	}
	else if (timeSince / 60 / 60 / 24 / 30 < 12) {
		timeSince = (Math.floor(timeSince / 60 / 60 / 24 / 30)) + " months";
	}
	else {
		timeSince = (Math.floor(timeSince / 60 / 60 / 24 / 30 / 12)) + " years";
	}

	return timeSince;
}



module.exports = router;