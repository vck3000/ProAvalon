var express = require("express");
var router = express.Router();
var forumThread = require("../../models/forumThread");
var lastIds = require("../../models/lastIds");
var middleware = require("../../middleware");
var sanitizeHtml = require('sanitize-html');
var getTimeDiffInString = require("../../assets/myLibraries/getTimeDiffInString");

var sanitizeHtmlAllowedTagsForumThread = ['img', 'iframe', 'h1', 'h2', 'u', 'span', 'br'];
var sanitizeHtmlAllowedAttributesForumThread = {
	a: ['href', 'name', 'target'],
	img: ['src', 'style'],
	iframe: ['src', 'style'],
	// '*': ['style'],
	table: ['class'],

	p: ['style'],

	span: ['style']
};




/**********************************************************/
//Show the forumThread
/**********************************************************/
router.get("/show/:id", function (req, res) {
	forumThread.findById(req.params.id).populate("comments").populate({ path: "comments", populate: { path: "replies" } }).exec(function (err, foundForumThread) {
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

				//update the time since string for each reply to a comment
				comment.replies.forEach(function (reply) {
					reply.timeSinceString = getTimeDiffInString(reply.timeLastEdit);
				});

				// console.log(comment.replies);
			});
			res.render("forum/show", { forumThread: foundForumThread, currentUser: req.user });
		}
	});
});

/**********************************************************/
//Show the create new forumThread page
/**********************************************************/
router.get("/new", middleware.isLoggedIn, function (req, res) {
	// console.log("NEW STUFF ");
	res.render("forum/new", { currentUser: req.user });
});

/**********************************************************/
//Create a new forumThread
/**********************************************************/
router.post("/", middleware.isLoggedIn, async function (req, res) {
	const util = require('util');

    //get the category based on the user selection
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
	else {
		category = "offTopic";
    }
    
    //grab the next number id from db
	var number = 0;
	await lastIds.findOne({}).exec(async function (err, returnedLastId) {
		number = returnedLastId.number;
		returnedLastId.number++;
		await returnedLastId.save();

		var newForumThread = {
			title: sanitizeHtml(req.body.title),
			description: sanitizeHtml(req.body.description, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
                allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
            }),

			hoursSinceLastEdit: 0,
			timeCreated: new Date(),
			likes: 0,
			numOfComments: 0,
			timeLastEdit: new Date(),
			author: {
                id: req.user._id,
                username: req.user.username
            },
			comments: [],
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
});






/**********************************************************/
//Show the edit forumThread route
/**********************************************************/
router.get("/:id/edit", middleware.checkForumThreadOwnership, function (req, res) {
	forumThread.findById(req.params.id, function (err, foundForumThread) {
		res.render("forum/edit", { forumThread: foundForumThread, currentUser: req.user });
	});
});

/**********************************************************/
//Update the forumThread route
/**********************************************************/
router.put("/:id", middleware.checkForumThreadOwnership, function (req, res) {
	//find and update the correct campground

	var category = "";
	var categoryChange = false;
	if (req.body.avalon) {
		category = "avalon";
		categoryChange = true;
	}
	else if (req.body.offTopic) {
		category = "offTopic";
		categoryChange = true;
	}
	else if (req.body.suggestion) {
		category = "suggestion";
		categoryChange = true;
	}
	else if (req.body.bug) {
		category = "bug";
		categoryChange = true;
	}

	if (categoryChange === true) {
		//update the category
		req.body.forumThread.category = category;
	}

    //add the required changes for an edit
	req.body.forumThread.edited = true;
    req.body.forumThread.timeLastEdit = new Date();
    
	//sanitize the description once again
	req.body.forumThread.description = sanitizeHtml(req.body.forumThread.description, {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(sanitizeHtmlAllowedTagsForumThread),
		allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
	});

	//Even though EJS <%= %> doesn't allow for injection, it still displays and in case it fails,
	//we should sanitize the title anyway.
	req.body.forumThread.title = sanitizeHtml(req.body.forumThread.title);

	forumThread.findByIdAndUpdate(req.params.id, req.body.forumThread, function (err, updatedForumThread) {
		if (err) {
			res.redirect("/forum");
		} else {
			res.redirect("/forum/show/" + updatedForumThread.id);
		}
	});
});


/**********************************************************/
//Destroy the forumThread route
/**********************************************************/
router.delete("/deleteForumThread/:id", middleware.checkForumThreadOwnership, function (req, res) {
	forumThread.findByIdAndRemove(req.params.id, function (err) {
		if (err) {
			res.redirect("/forum");
		} else {
			console.log("Deleted a forumThread.");
			res.redirect("/forum");
		}
	});
});


module.exports = router;