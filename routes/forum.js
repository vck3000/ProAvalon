var express = require("express");
var router = express.Router();
var forumThread = require("../models/forumThread");
var forumThreadComment = require("../models/forumThreadComment");
var forumThreadCommentReply = require("../models/forumThreadCommentReply");
var lastIds = require("../models/lastIds");
var middleware = require("../middleware");
var sanitizeHtml = require('sanitize-html');

var pinnedThread = require("../models/pinnedThread");
var getTimeDiffInString = require("../assets/myLibraries/getTimeDiffInString");


//grab the routes
var forumThreadRoutes = require("../routes/forum/forumThreadRoutes");
router.use(forumThreadRoutes);

var forumThreadCommentRoutes = require("../routes/forum/forumThreadCommentRoutes");
router.use(forumThreadCommentRoutes);

var forumThreadCommentReplyRoutes = require("../routes/forum/forumThreadCommentReplyRoutes");
router.use(forumThreadCommentReplyRoutes);


router.get("/", function (req, res) {
	res.redirect("/forum/page/1");
});

router.get("/page/:category/:pageNum", function(req, res){
	console.log("category");
	
	//if theres an invalid page num, redirect to page 1
	if (req.params.pageNum < 1) {
		res.redirect("/forum/page/" + req.params.category + "/1");
	}

	//get all forumThreads from DB
	//then render

	var NUM_OF_RESULTS_PER_PAGE = 10;
	//if user specified num of results per page:
	if (req.params.numOfResultsPerPage) {
		NUM_OF_RESULTS_PER_PAGE = req.params.numOfResultsPerPage;
	}
	
	var skipNumber = 0;
	//if we have a specified pageNum, then skip a bit
	if (req.params.pageNum) {
		//-1 because page numbers start at 1
		skipNumber = (req.params.pageNum - 1) * NUM_OF_RESULTS_PER_PAGE;
	}

	forumThread.find({category: req.params.category}).sort({ timeLastEdit: 'descending' }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
		.exec(function (err, allForumThreads) {
			if (err) {
				console.log(err);
			}
			else {
				allForumThreads.forEach(function (forumThread) {
					forumThread.timeSinceString = getTimeDiffInString(forumThread.timeLastEdit);
				});

				res.render("forum/index", {
					allPinnedThreads: [],
					allForumThreads: allForumThreads,
					currentUser: req.user,
					pageNum: req.params.pageNum,
					activeCategory: req.params.category
				});				
			}
		});
});

router.get("/page/:pageNum", function (req, res) {
	console.log("pageNum");
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

	forumThread.find({}).sort({ timeLastEdit: 'descending' }).skip(skipNumber).limit(NUM_OF_RESULTS_PER_PAGE)
		.exec(function (err, allForumThreads) {
			if (err) {
				console.log(err);
			}
			else {
				allForumThreads.forEach(function (forumThread) {
					forumThread.timeSinceString = getTimeDiffInString(forumThread.timeLastEdit);
				});

				pinnedThread.find({}).exec(async function (err, allPinnedThreadIds) {
					if (err) {
						console.log(err);
					}
					else {
						//get all the pinned threads
						var allPinnedThreads = [];

						for (var i = 0; i < allPinnedThreadIds.length; i++) {
							await forumThread.findById(allPinnedThreadIds[i].forumThread.id, function (err, pinnedThread) {

								pinnedThread.timeSinceString = getTimeDiffInString(pinnedThread.timeLastEdit);

								allPinnedThreads.push(pinnedThread);
							});
						}



						res.render("forum/index", {
							allPinnedThreads: allPinnedThreads,
							allForumThreads: allForumThreads,
							currentUser: req.user,
							pageNum: req.params.pageNum
						});
					}
				});
			}
		});
});

module.exports = router;