var mongoose = require("mongoose");
var forumThread = require("./models/forumThread");
var forumThreadComment = require("./models/forumThreadComment");
var lastIds = require("./models/lastIds");


var date = new Date();
// date = date.getTime();
// date = date.toUTCString();

var data = [
    {
        title: "Welcome to the forums! Please read this before posting.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1486954000000),
        timeLastEdit: date.setTime(1486954000000),

        numOfComments: 31,
        likes: 12,
        hoursSinceLastEdit: 8,

        category: "offTopic"
    },
    {
        title: "Is Merlin broken!?!?",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1487954000000),
        timeLastEdit: date.setTime(1487954000000),

        numOfComments: 16,
        likes: 12,
        hoursSinceLastEdit: 12,

        category: "avalon"
    },
    {
        title: "My Percivals are always useless!!",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1488954000000),
        timeLastEdit: date.setTime(1488954000000),

        numOfComments: 16,
        likes: 12,
        hoursSinceLastEdit: 12,

        category: "avalon"
    },
    {
        title: "Guns aren't displaying correctly.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1489954000000),
        timeLastEdit: date.setTime(1489954000000),

        numOfComments: 13,
        likes: 1,
        hoursSinceLastEdit: 2,

        category: "bug"
    },
    {
        title: "Database is failing.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1490954000000),
        timeLastEdit: date.setTime(1490954000000),

        numOfComments: 13,
        likes: 1,
        hoursSinceLastEdit: 2,

        category: "bug"
    },
    {
        title: "I can't get number ids to work :(.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1491954000000),
        timeLastEdit: date.setTime(1491954000000),

        numOfComments: 13,
        likes: 1,
        hoursSinceLastEdit: 2,

        category: "bug"
    },
    {
        title: "halp.",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: { username: "ProNub" },
        timeCreated: date.setTime(1492954000000),
        timeLastEdit: date.setTime(1492954000000),

        numOfComments: 13,
        likes: 1,
        hoursSinceLastEdit: 2,

        category: "bug"
    }
]

var lastIdsReturned;

function seedDB() {
    //clear lastIds
    lastIds.remove({}).exec()
        //create a single number
        .then(function () {
            return lastIds.create({ number: 1 });
        })

        //remove all forumThreads
        .then(function (thatNumber) {
            lastIdsReturned = thatNumber;
            return forumThread.remove({});
        })

        //remove all comments
        .then(function () {
            return forumThreadComment.remove({});
        })

        //create forum threads
        .then(function () {

            data.forEach(async function (seed) {
                var num = 0;
                num = lastIdsReturned.number;

                lastIdsReturned.number++;
                await lastIdsReturned.save();
                console.log(num);

                seed.numberId = num;
                
                
                //create each forum thread
                await forumThread.create(seed)
                    .then(async function (createdForumThread) {
                        console.log("Created new forum thread");

                        //create a comment for each forum thread
                        await forumThreadComment.create({
                            text: "Avalon is the best!!!!",
                            author: { username: "defnotProNub" },
                            timeCreated: date.setTime(1514725200000),
                            timeLastEdit: date.setTime(1514725200000),
                            likes: 1
                        })
                            .then(function (createdComment) {
                                createdForumThread.comments.push(createdComment);
                                createdForumThread.save();
                                console.log("Created new comment");
                            })
                    });
            });
        });
}

module.exports = seedDB;
