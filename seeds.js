var mongoose = require("mongoose");
var forumThread = require("./models/forumThread");
var forumThreadComment = require("./models/forumThreadComment");


var date = new Date();
// date = date.getTime();
// date = date.toUTCString();

var data = [
    {
        title: "Welcome to the forums! Please read this before posting.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1520427600000),

        numOfComments: 31,
        likes: 12,
        hoursSinceLastEdit: 8,

        category: "off-topic"
    },
    {
        title: "Is Merlin broken!?!?",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1521427600000),

        numOfComments: 16,
        likes: 12,
        hoursSinceLastEdit: 12,

        category: "avalon"
    },
    {
        title: "My Percivals are always useless!!",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1522427600000),

        numOfComments: 16,
        likes: 12,
        hoursSinceLastEdit: 12,

        category: "avalon"
    },
    {
        title: "Guns aren't displaying correctly.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1523427600000),

        numOfComments: 13,
        likes: 1,
        hoursSinceLastEdit: 2,

        category: "bug"
    },
    {
        title: "Database is failing.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1524427600000),

        numOfComments: 13,
        likes: 1,
        hoursSinceLastEdit: 2,

        category: "bug"
    },
    {
        title: "I can't get number ids to work :(.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1525427600000),

        numOfComments: 13,
        likes: 1,
        hoursSinceLastEdit: 2,

        category: "bug"
    },
    {
        title: "halp.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1526427600000),

        numOfComments: 13,
        likes: 1,
        hoursSinceLastEdit: 2,

        category: "bug"
    }
]

function seedDB() {
    //Remove all forumThreads
    forumThread.remove({}, function (err) {
        if (err) {
            console.log(err);
        }
        console.log("removed all forums");
        forumThreadComment.remove({}, function (err) {
            if (err) {
                console.log(err);
            }
            console.log("removed all comments");
            data.forEach(function (seed) {
                forumThread.create(seed, function (err, forumThreadReturned) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("added a forumThread");

                        //create a comment
                        forumThreadComment.create({
                            text: "This place is great, but I wish there was internet",
                            author: { username: "Homer" },
                            timeCreated: date.setTime(1514725200000),
                            likes: 1

                        }, function (err, comment) {
                            if (err) {
                                console.log(err);
                            } else {
                                forumThreadReturned.comments.push(comment);
                                forumThreadReturned.save();
                                console.log("Created new comment");
                            }
                        });
                    }
                });
            });
        });

    });
    //add a few comments
}

module.exports = seedDB;
