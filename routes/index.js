const { Router } = require('express');
const passport = require('passport');
const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const fs = require('fs');
const request = require('request');
const rateLimit = require('express-rate-limit');

const User = require('../models/user');
const myNotification = require('../models/notification');
const gameRecord = require('../models/gameRecord');
const statsCumulative = require('../models/statsCumulative');

const { isMod } = require('./middleware');

const modsArray = require('../modsadmins/mods');

// Prevent too many requests
// app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

const router = new Router();

// exclude pronub from new mods array
const newModsArray = modsArray.filter((mod) => mod != 'pronub');
// Community route
router.get('/community', (req, res) => {
    // Get all players with more than 50 games excluding mods
    User.find({
        totalGamesPlayed: { $gt: 99 },
        usernameLower: { $nin: newModsArray },
        hideStats: null,
    }, (err, allUsers) => {
        if (err) {
            console.log(err);
        } else {
            // Get mods excluding pronub
            User.find({
                usernameLower: { $in: newModsArray },
            },
                (err, allMods) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render('community', {
                            users: allUsers, mods: allMods, currentUser: req.user, headerActive: 'community',
                        });
                    }
                });
        }
        // sort by games played
    }).sort({ totalGamesPlayed: -1 });
});

// Index route
router.get('/', (req, res) => {
    if (req.session) {
        req.session.destroy();
    }
    res.render('index');
});

// register route
router.get('/register', (req, res) => {
    res.render('register', { platform: process.env.MY_PLATFORM });
});


// sitedown route
router.get('/sitedown', (req, res) => {
    res.render('sitedown');
});


const registerLimiter = process.env.MY_PLATFORM === 'local'
    ? rateLimit({
        max: 0, // Disable if we are local
    })
    : rateLimit({
        windowMs: 60 * 60 * 1000, // 60 minutes
        max: 3,
    });

// Post of the register route - Create an account
router.post('/', registerLimiter, sanitiseUsername, (req, res) => {
    // console.log("escaped: " + escapeText(req.body.username));

    // res.redirect("sitedown");
    // return;

    // var escapedUsername = escapeText(req.body.username);

    // if we are local, we can skip the captcha
    if (process.env.MY_PLATFORM === 'local' || process.env.MY_PLATFORM === 'staging') {
        // duplicate code as below
        const newUser = new User({
            username: req.body.username,
            usernameLower: req.body.username.toLowerCase(),
            dateJoined: new Date(),
        });

        if (req.body.username.indexOf(' ') !== -1) {
            req.flash('error', 'Sign up failed. Please do not use spaces in your username.');
            res.redirect('register');
        } else if (req.body.username.length > 25) {
            req.flash('error', 'Sign up failed. Please do not use more than 25 characters in your username.');
            res.redirect('register');
        } else if (usernameContainsBadCharacter(req.body.username) == true) {
            req.flash('error', 'Please do not use an illegal character');
            res.redirect('register');
        } else {
            User.register(newUser, req.body.password, (err, user) => {
                if (err) {
                    console.log(`ERROR: ${err}`);
                    req.flash('error', 'Sign up failed. Most likely that username is taken.');
                    res.redirect('register');
                } else {
                    // successful, get them to log in again
                    // req.flash("success", "Sign up successful. Please log in.");
                    // res.redirect("/");

                    passport.authenticate('local')(req, res, () => {
                        res.redirect('/lobby');
                    });
                }
            });
        }
    }


    // we are online, require the captcha
    else {
        req.body.captcha = req.body['g-recaptcha-response'];


        if (
            req.body.captcha === undefined
            || req.body.captcha === ''
            || req.body.captcha === null
        ) {
            req.flash('error', 'The captcha failed or was not inputted.');
            res.redirect('register');
            return;
        }

        const secretKey = process.env.MY_SECRET_GOOGLE_CAPTCHA_KEY;

        const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;

        request(verifyUrl, (err, response, body) => {
            body = JSON.parse(body);
            // console.log(body);

            // If Not Successful
            if (body.success !== undefined && !body.success) {
                req.flash('error', 'Failed captcha verification.');
                res.redirect('register');
                return;
            }

            const newUser = new User({
                username: req.body.username,
                usernameLower: req.body.username.toLowerCase(),
                dateJoined: new Date(),
            });

            if (req.body.username.indexOf(' ') !== -1) {
                req.flash('error', 'Sign up failed. Please do not use spaces in your username.');
                res.redirect('register');
            } else if (req.body.username.length > 25) {
                req.flash('error', 'Sign up failed. Please do not use more than 25 characters in your username.');
                res.redirect('register');
            } else if (usernameContainsBadCharacter(req.body.username) == true) {
                req.flash('error', 'Please do not use an illegal character');
                res.redirect('register');
            } else {
                User.register(newUser, req.body.password, (err, user) => {
                    if (err) {
                        console.log(`ERROR: ${err}`);
                        req.flash('error', 'Sign up failed. Most likely that username is taken.');
                        res.redirect('register');
                    } else {
                        // successful, get them to log in again
                        // req.flash("success", "Sign up successful. Please log in.");
                        // res.redirect("/");
                        passport.authenticate('local')(req, res, () => {
                            res.redirect('/lobby');
                        });
                    }
                });
            }
        });
    }
});


const loginLimiter = process.env.MY_PLATFORM === 'local'
    ? rateLimit({
        max: 0, // Disable if we are local
    })
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5,
    });

// login route
router.post('/login', loginLimiter, sanitiseUsername, passport.authenticate('local', {
    successRedirect: '/lobby',
    failureRedirect: '/loginFail',
}));

router.get('/loginFail', (req, res) => {
    req.flash('error', 'Log in failed! Please try again.');
    res.redirect('/');
});

// /lobby route is in a separate file.

// logout
router.get('/logout', (req, res) => {
    // doesn't work since we destroy the session right after...
    // req.flash("success", "Logged you out!");
    req.session.destroy((err) => {
        res.redirect('/'); // Inside a callback… bulletproof!
    });
});

router.get('/log', (req, res) => {
    res.render('log', { currentUser: req.user, headerActive: 'log', path: 'log' });
});

router.get('/rules', (req, res) => {
    res.render('rules', { currentUser: req.user, headerActive: 'rules' });
});

router.get('/testmodal', (req, res) => {
    res.render('testmodal', { currentUser: req.user });
});
router.get('/testmodal2', (req, res) => {
    res.render('testmodal2', { currentUser: req.user });
});

router.get('/testAutoCompleteUsernames', (req, res) => {
    res.render('testAutoCompleteUsernames', { currentUser: req.user });
});

router.get('/about', (req, res) => {
    res.render('about', { currentUser: req.user, headerActive: 'about' });
});

router.get('/security', (req, res) => {
    res.render('security', { currentUser: req.user });
});

router.get('/troubleshooting', (req, res) => {
    res.render('troubleshooting', { currentUser: req.user });
});

router.get('/statistics', (req, res) => {
    res.render('statistics', { currentUser: req.user, headerActive: 'stats' });
});

router.get('/leaderboard', async (req, res) => {
    const users = await User.find({}).exec();
    const leaderboard = {};
    users.forEach((user) => {
        Object.values(user.roleStats).forEach((obj) => {
            Object.keys(obj).forEach((key) => {
                if (!leaderboard[key]) leaderboard[key] = { username: '', score: 0 };
                let total = 0;
                if (obj[key].wins) {
                    total += obj[key].wins;
                }
                if (total > leaderboard[key].score) leaderboard[key] = { username: user.username, score: total };
            });
        });
    });
    res.render('leaderboard', { leaderboard });
});


function gameDateCompare(a, b) {
    if (a.date < b.date) {
        return -1;
    }
    if (a.date > b.date) {
        return 1;
    }

    return 0;
}


router.get('/ajax/getStatistics', (req, res) => {
    statsCumulative.findOne({}).exec((err, record) => {
        if (err) {
            console.log(err);
            res.status(200).send('Something went wrong');
        } else {
            //    console.log(record);
            if (record === undefined || record === null) {
                res.status(200).send('Something went wrong');
            } else {
                // console.log(record);
                res.status(200).send(JSON.parse(record.data));
            }
        }
    });
});

const anonymizeArray = function (array, idmap) {
    if (!array) {
        return array;
    }
    const anonArray = [];
    for (let i = 0; i < array.length; i++) {
        anonArray.push(idmap[array[i]]);
    }
    return anonArray;
};

const anonymizeMapKeys = function (map, idmap) {
    if (!map) {
        return map;
    }
    const anonMap = JSON.parse(JSON.stringify(map));
    for (const key in map) {
        if (!map.hasOwnProperty(key)) {
            continue;
        }
        if (key !== idmap[key]) {
            Object.defineProperty(anonMap, idmap[key], Object.getOwnPropertyDescriptor(anonMap, key));
            delete anonMap[key];
        }
    }
    return anonMap;
};

const anonymizeStats = function (records) {
    const anonymizedRecords = [];
    for (var key in records) {
        const record = records[key];
        const anonymizedRecord = JSON.parse(JSON.stringify(record));
        const usernamesMap = {};
        const usernamesPossible = 'abcdefghijklmnopqrstuvwxyz'; let
            idx = 0;
        for (var key in record.playerRoles) {
            if (record.playerRoles.hasOwnProperty(key)) {
                usernamesMap[key] = usernamesPossible[idx++];
            }
        }
        anonymizedRecord.spyTeam = anonymizeArray(record.spyTeam, usernamesMap);
        anonymizedRecord.resistanceTeam = anonymizeArray(record.resistanceTeam, usernamesMap);
        anonymizedRecord.ladyHistoryUsernames = anonymizeArray(record.ladyHistoryUsernames, usernamesMap);
        anonymizedRecord.refHistoryUsernames = anonymizeArray(record.refHistoryUsernames, usernamesMap);
        anonymizedRecord.sireHistoryUsernames = anonymizeArray(record.sireHistoryUsernames, usernamesMap);
        anonymizedRecord.voteHistory = anonymizeMapKeys(record.voteHistory, usernamesMap);
        anonymizedRecord.playerRoles = anonymizeMapKeys(record.playerRoles, usernamesMap);
        anonymizedRecords.push(anonymizedRecord);
    }
    return anonymizedRecords;
};

router.get('/gameRecordsData', (req, res) => {
    res.download('assets/gameRecordsData/gameRecordsDataAnon.json');
});


const hardUpdateStatsFunction = function () {
    console.log('Starting hard update stats...');
    gameRecord.find({}).exec((err, records) => {
        if (err) {
            console.log(err);
        } else {
            processRecords(records);
        }
    });
};

const processRecords = function (records) {
    const prevRecordsLength = records.length;
    console.log(`${records.length} games loaded.`);
    fs.writeFileSync('assets/gameRecordsData/gameRecordsData.json', JSON.stringify(records));
    // Anonymize it using gameRecordsData

    // Filter out the bot games
    records = records.filter((r) => (r.gameMode === undefined || r.gameMode.toLowerCase().includes('bot') == false));
    console.log(`Removed ${prevRecordsLength - records.length} bot games from dataset.`);

    const gameRecordsDataAnon = anonymizeStats(records);

    fs.writeFileSync('assets/gameRecordsData/gameRecordsDataAnon.json', JSON.stringify(gameRecordsDataAnon));


    const obj = {};
    obj.totalgamesplayed = records.length;

    //* **********************************
    // Site traffic stats - one data point per day
    //* **********************************
    const gamesPlayedData = {};
    const xAxisVars = [];
    const yAxisVars = [];
    for (var i = 0; i < records.length; i++) {
        const timeFinish = records[i].timeGameFinished;
        // Round to nearest day
        const dayFinished = new Date(timeFinish.getFullYear(), timeFinish.getMonth(), timeFinish.getDate());

        // Count the number of games played on the same day
        if (gamesPlayedData[dayFinished.getTime()] === undefined) {
            gamesPlayedData[dayFinished.getTime()] = 1;
        } else {
            gamesPlayedData[dayFinished.getTime()] = gamesPlayedData[dayFinished.getTime()] + 1;
        }
    }

    const gamesPlayedDataArray = [];
    // Turn it into an array of objects
    for (const key in gamesPlayedData) {
        if (gamesPlayedData.hasOwnProperty(key)) {
            const newObj = {
                date: key,
                value: gamesPlayedData[key],
            };

            gamesPlayedDataArray.push(newObj);
        }
    }

    // Sort it
    gamesPlayedDataArray.sort(gameDateCompare);

    fs.writeFileSync('assets/gameRecordsData/test.json', JSON.stringify(gamesPlayedDataArray));

    // Split it into the two axis
    for (var i = 0; i < gamesPlayedDataArray.length; i++) {
        xAxisVars.push(gamesPlayedDataArray[i].date);
        yAxisVars.push(gamesPlayedDataArray[i].value);
        // yAxisVars.push(new Date(gamesPlayedDataArray[i].value)); // This line seems to make server hang..?
    }

    // Remove the last entry since the day isn't over yet...
    xAxisVars.pop();
    yAxisVars.pop();

    obj.siteTrafficGamesPlayedXAxis = xAxisVars;
    obj.siteTrafficGamesPlayedYAxis = yAxisVars;


    //* *********************************************
    // Getting the average duration of each game
    //* *********************************************
    let averageGameDuration = new Date(0);
    for (var i = 0; i < records.length; i++) {
        var duration = new Date(records[i].timeGameFinished.getTime() - records[i].timeGameStarted.getTime());
        averageGameDuration = new Date(averageGameDuration.getTime() + duration.getTime());
    }
    obj.averageGameDuration = new Date(averageGameDuration.getTime() / records.length);


    //* *********************************************
    // Getting the win rate of alliances globally
    //* *********************************************
    let resWins = 0;
    let spyWins = 0;
    for (var i = 0; i < records.length; i++) {
        if (records[i].winningTeam === 'Resistance') {
            resWins++;
            // console.log("res win: ");
            // console.log(resWins);
        } else if (records[i].winningTeam === 'Spy') {
            spyWins++;
            // console.log("spy win: ");
            // console.log(spyWins);
        }
        // console.log("winning team:");
        // console.log(records[i].winningTeam);
    }
    obj.totalResWins = resWins;
    obj.totalSpyWins = spyWins;


    //* *********************************************
    // Getting the assassination win rate
    //* *********************************************
    const rolesShotObj = {};
    for (var i = 0; i < records.length; i++) {
        const roleShot = records[i].whoAssassinShot;
        if (roleShot) {
            // console.log("a");
            if (rolesShotObj[roleShot] !== undefined) {
                rolesShotObj[roleShot] = rolesShotObj[roleShot] + 1;
                // console.log(roleShot + " was shot, total count: " + rolesShotObj[roleShot]);
            } else {
                rolesShotObj[roleShot] = 0;
            }
        }
    }

    obj.assassinRolesShot = rolesShotObj;


    //* *********************************************
    // Getting the average duration of each assassination
    //* *********************************************
    let averageAssassinationDuration = new Date(0);
    let count = 0;
    for (var i = 0; i < records.length; i++) {
        if (records[i].timeAssassinationStarted) {
            var duration = new Date(records[i].timeGameFinished.getTime() - records[i].timeAssassinationStarted.getTime());
            averageAssassinationDuration = new Date(averageAssassinationDuration.getTime() + duration.getTime());
            count++;
        }
    }
    obj.averageAssassinationDuration = new Date(averageAssassinationDuration.getTime() / count);

    //* *********************************************
    // Getting the win rate for each game size
    //* *********************************************
    const gameSizeWins = {};

    for (var i = 0; i < records.length; i++) {
        if (!gameSizeWins[records[i].numberOfPlayers]) {
            gameSizeWins[records[i].numberOfPlayers] = {};
            gameSizeWins[records[i].numberOfPlayers].spy = 0;
            gameSizeWins[records[i].numberOfPlayers].res = 0;
        }

        if (records[i].winningTeam === 'Spy') {
            gameSizeWins[records[i].numberOfPlayers].spy++;
        } else if (records[i].winningTeam === 'Resistance') {
            gameSizeWins[records[i].numberOfPlayers].res++;
        } else {
            console.log(`error, winning team not recognised: ${records[i].winningTeam}`);
        }
    }
    obj.gameSizeWins = gameSizeWins;


    //* *********************************************
    // Getting the spy wins breakdown
    //* *********************************************
    const spyWinBreakdown = {};

    for (var i = 0; i < records.length; i++) {
        if (records[i].winningTeam === 'Spy') {
            if (!spyWinBreakdown[records[i].howTheGameWasWon]) {
                spyWinBreakdown[records[i].howTheGameWasWon] = 0;
            }

            spyWinBreakdown[records[i].howTheGameWasWon]++;
        }
    }
    obj.spyWinBreakdown = spyWinBreakdown;


    //* *********************************************
    // Getting the Lady of the lake wins breakdown
    //* *********************************************
    const ladyBreakdown = {
        resStart: {
            resWin: 0,
            spyWin: 0,
        },
        spyStart: {
            resWin: 0,
            spyWin: 0,
        },
    };


    // IMPORTANT, MUST KEEP THESE ROLES UP TO DATE!
    // SHOULD MAKE AN EXTERNAL FILE OF THESE ALLIANCES
    const resRoles = ['Merlin', 'Percival', 'Resistance', 'Isolde', 'Tristan'];
    const spyRoles = ['Assassin', 'Morgana', 'Spy', 'Mordred', 'Oberon'];


    for (var i = 0; i < records.length; i++) {
        if (records[i].ladyChain.length > 0) {
            // if the first person who held the card is a res
            if (resRoles.indexOf(records[i].ladyChain[0]) !== -1) {
                if (records[i].winningTeam === 'Resistance') {
                    ladyBreakdown.resStart.resWin++;
                } else if (records[i].winningTeam === 'Spy') {
                    ladyBreakdown.resStart.spyWin++;
                }
            }
            // if the first person who held the card is a spy
            else if (spyRoles.indexOf(records[i].ladyChain[0]) !== -1) {
                if (records[i].winningTeam === 'Resistance') {
                    ladyBreakdown.spyStart.resWin++;
                } else if (records[i].winningTeam === 'Spy') {
                    ladyBreakdown.spyStart.spyWin++;
                }
            } else {
                console.log(`ERROR no alliance assigned to role: ${records[i].ladyChain[0]}`);
            }
        }
    }
    obj.ladyBreakdown = ladyBreakdown;


    //* *********************************************
    // Getting the average duration of each game
    //* *********************************************
    const averageGameDurations = [];
    const countForGameSize = [];
    for (var i = 5; i < 11; i++) {
        averageGameDurations[i] = new Date(0);
        countForGameSize[i] = 0;
    }

    // console.log(averageGameDurations);

    for (var i = 0; i < records.length; i++) {
        var duration = new Date(records[i].timeGameFinished.getTime() - records[i].timeGameStarted.getTime());

        // console.log(records[i].numberOfPlayers);

        averageGameDurations[records[i].numberOfPlayers] = new Date(averageGameDurations[records[i].numberOfPlayers].getTime() + duration.getTime());
        countForGameSize[records[i].numberOfPlayers]++;
    }
    obj['5paverageGameDuration'] = new Date(averageGameDurations[5].getTime() / countForGameSize['5']);
    obj['6paverageGameDuration'] = new Date(averageGameDurations[6].getTime() / countForGameSize['6']);
    obj['7paverageGameDuration'] = new Date(averageGameDurations[7].getTime() / countForGameSize['7']);
    obj['8paverageGameDuration'] = new Date(averageGameDurations[8].getTime() / countForGameSize['8']);
    obj['9paverageGameDuration'] = new Date(averageGameDurations[9].getTime() / countForGameSize['9']);
    obj['10paverageGameDuration'] = new Date(averageGameDurations[10].getTime() / countForGameSize['10']);

    obj.timeCreated = new Date();

    clientStatsData = obj;


    console.log('Done processing, now saving.');

    statsCumulative.remove({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Removed past cumulative object');
            statsCumulative.create({ data: JSON.stringify(clientStatsData) }, (err) => {
                console.log('Successfully saved new cumulative object');
            });
        }
    });

    // res.status(200).send(clientStatsData);
}


router.get('/updateStats', (req, res) => {
    setTimeout(hardUpdateStatsFunction, 5000);
    res.send('Starting update...');
});


router.get('/ajax/profile/getProfileData/:profileUsername', (req, res) => {
    User.findOne({ username: req.params.profileUsername }, (err, foundUser) => {
        if (err) {
            console.log(err);
            res.status(200).send('error');
        } else if (foundUser) {
            const sendUserData = {};
            sendUserData.username = foundUser.username;
            sendUserData.avatarImgRes = foundUser.avatarImgRes;
            sendUserData.avatarImgSpy = foundUser.avatarImgSpy;
            sendUserData.nationality = foundUser.nationality;
            sendUserData.nationCode = foundUser.nationCode;
            sendUserData.dateJoined = foundUser.dateJoined;
            sendUserData.biography = foundUser.biography;
            sendUserData.hideStats = foundUser.hideStats;

            if (!foundUser.hideStats) {
                sendUserData.totalGamesPlayed = foundUser.totalGamesPlayed;
                sendUserData.totalWins = foundUser.totalWins;
                sendUserData.totalLosses = foundUser.totalLosses;
                sendUserData.totalTimePlayed = foundUser.totalTimePlayed;
                sendUserData.roleStats = foundUser.roleStats;
                sendUserData.totalResWins = foundUser.totalResWins;
                sendUserData.totalResLosses = foundUser.totalResLosses;
            }


            res.status(200).send(sendUserData);
        }
    });
    // console.log("Received AJAX request");
});


router.get('/ajax/seenNotification', (req, res) => {
    // console.log("seen nofication");
    // console.log(req.query.idOfNotif);


    // console.log(mongoose.Types.ObjectId(req.query.idOfNotif));

    myNotification.findById(mongoose.Types.ObjectId(req.query.idOfNotif), (err, notif) => {
        if (err) {
            console.log(err);
        }
        if (notif && notif !== null && notif !== undefined) {
            notif.seen = true;
            const promiseReturned = notif.save();

            promiseReturned.then(() => {
                User.findOne({ username: req.user.username }).populate('notifications').exec(async (err, foundUser) => {
                    foundUser.markModified('notifications');
                    await foundUser.save();
                });
            });
        }
    });

    res.status(200).send('done');
});


router.get('/ajax/hideNotification', (req, res) => {
    // console.log("hide notification");
    // console.log(req.query.idOfNotif);


    // console.log(mongoose.Types.ObjectId(req.query.idOfNotif));
    myNotification.findByIdAndRemove(mongoose.Types.ObjectId(req.query.idOfNotif), (err) => {
        if (err) {
            console.log(err);
        }

        if (req !== undefined && req.user !== undefined) {
            User.findOne({ username: req.user.username }).populate('notifications').exec(async (err, foundUser) => {
                foundUser.markModified('notifications');
                await foundUser.save();
            });
        }
    });

    res.status(200).send('done');
});

router.get('/ajax/hideAllNotifications', (req, res) => {
    // console.log("hide all nofications");

    User.findById(req.user._id).populate('notifications').exec(async (err, foundUser) => {
        if (err) {
            console.log(err);
        }
        // console.log(foundUser.notifications);

        foundUser.notifications.forEach((notif) => {
            // console.log("removing notif");
            // console.log(notif);
            myNotification.findByIdAndRemove(notif._id, (err) => {
                // console.log("callback");
            });
        });

        foundUser.notifications = [];

        foundUser.markModified('notifications');
        foundUser.save();
    });
    res.status(200).send('done');
});

function escapeTextUsername(req, res, next) {
    req.body.username = escapeText(req.body.username);
    next();
}

function sanitiseUsername(req, res, next) {
    req.body.username = sanitizeHtml(req.body.username, {
        allowedTags: [],
        allowedAttributes: [],
    });

    next();
}

module.exports = router;


function usernameContainsBadCharacter(str) {
    // only allow alphanumerical
    const regx = /^[A-Za-z0-9]+$/;

    if (str.includes('&amp;')
        || str.includes('&lt;')
        || str.includes('&gt;')
        || str.includes('&apos;')
        || str.includes('&quot;')
        || str.includes('[')
        || str.includes(']')
        || str.includes('/')
        || str.includes('\\')
        || str.includes('&')
        || str.includes(';')
    ) {
        return true;
    }
    if (!regx.test(str)) {
        return true;
    }

    return false;
}


function escapeText(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;')
        .replace(/(?:\r\n|\r|\n)/g, ' <br>');
}
