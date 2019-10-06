const { Router } = require('express');
const router = new Router();
const { isMod } = require('./middleware');
const User = require('../models/user');
const Ban = require('../models/ban');
const ModLog = require('../models/modLog');
const multer = require('multer');
const upload = multer();

const requiredFields = ['banPlayerUsername', 'reason', 'duration', 'duration_units', 'descriptionByMod'];

router.post('/ban', upload.none(), async (req, res) => {
    // Catch errors so that it's not shown to users.
    try {
        // Multiple checks:
        // 0: Redundant mod check?

        // 1: All fields are filled in and valid
        for (var s of requiredFields) {
            if (req.body[s] === undefined || req.body[s] === '') {
                res.status(400);
                res.send(`Missing parameter: '${s}'.`);
                return;
            }
        }

        // 1b: Check that duration is a strict number:
        const durationInt = parseInt(Number(req.body['duration']), 10);
        if (isNaN(durationInt)) {
            res.status(400);
            res.send(`Duration must be a number, not: '${req.body['duration']}'.`);
            return;
        }

        // 2: Either userban or IP ban or BOTH checkboxes must be ticked.
        var boxCount = 0;
        if (req.body["userBanCheckbox"] === "on") {
            boxCount++;
        }
        if (req.body["IPBanCheckbox"] === "on") {
            boxCount++;
        }
        if (req.body["SingleIPBanCheckbox"] === "on") {
            boxCount++;
        }

        // Prohibit both choices. Can only have one.
        if (req.body["IPBanCheckbox"] === "on" && req.body["SingleIPBanCheckbox"] === "on") {
            res.status(400);
            res.send(`May not select both IP ban checkboxes.`);
            return;
        }
        
        if (boxCount < 1) {
            res.status(400);
            res.send(`Must select at least one type of ban.`);
            return;
        }

        const banUser = await User.findOne({usernameLower: req.body['banPlayerUsername'].toLowerCase()});
        if (!banUser) {
            res.status(400);
            res.send(`${req.body['banPlayerUsername']} was not found.`);
            return;
        }

        if (!req.user) {
            res.status(400);
            res.send(`Cannot find who you are.`);
            return;
        }
        const modUser = req.user;

        // Single IP ban configuration:
        var ipsToBan;
        if (req.body["SingleIPBanCheckbox"] === "on") {
            ipsToBan = banUser.lastIPAddress;
        }
        else{
            ipsToBan = banUser.IPAddresses;
        }

                
        // Get duration for ban:
        const now = new Date();
        const whenMade = new Date();
        var whenRelease;
        switch (req.body['duration_units']) {
            case 'hrs':
                whenRelease = new Date(now.setHours(now.getHours() + durationInt));
                break;
            case 'days':
                whenRelease = new Date(now.setDate(now.getDate() + durationInt));
                break;
            case 'months':
                whenRelease = new Date(now.setMonth(now.getMonth() + durationInt));
                break;
            case 'years':
                whenRelease = new Date(now.setFullYear(now.getFullYear() + durationInt));
                break;
            case 'permaban':
                whenRelease = new Date(now.setFullYear(now.getFullYear() + 1000));
                break;
            default:
                res.status(400);
                res.send(`Invalid duration units: '${req.body['duration_units']}'.`);
                return;
        }

        // Create the data object
        const banData = {
            ipBan: (req.body["IPBanCheckbox"] === "on" || req.body["SingleIPBanCheckbox"] === "on") ? true : false,
            singleIPBan: req.body["SingleIPBanCheckbox"] === "on" ? true : false,
            userBan: req.body["userBanCheckbox"] === "on" ? true : false,
            bannedPlayer: {
                id: banUser._id,
                username: banUser.username,
                usernameLower: banUser.usernameLower
            },
            bannedIPs: ipsToBan,
            modWhoBanned: {
                id: modUser._id,
                username: modUser.username,
                usernameLower: modUser.usernameLower
            },
            whenMade: whenMade,
            durationToBan: `${req.body['duration']} ${req.body['duration_units']}`,
            whenRelease: whenRelease,
            descriptionByMod: req.body['descriptionByMod'],
            reason: req.body.reason
        };

        // console.log(banData);
        await Ban.create(banData);
        
        // Create mod log
        await ModLog.create({
            type: "ban",
            modWhoMade: {
                id: modUser._id,
                username: modUser.username,
                usernameLower: modUser.usernameLower
            },
            data: banData,
            dateCreated: new Date()
        });

        res.status(200);
        res.send(`The ban was successfully made.`);
        return;

    }
    catch (e) {
        console.log(e);
        res.status(400);
        res.send(`Something went terribly wrong...`);
    }
});

router.get('/', isMod, (req, res) => {
    res.render('mod/mod', { currentUser: req.user, isMod: true, headerActive: 'mod' });
});


// Get the moderation logs to show

// 1) Bans
// 2) Mutes
// 3) Forum removes
// 4) Comment and reply removes
// 5) Avatar request approve/rejects

router.get('/ajax/logData/:pageIndex', (req, res) => {
    // get all the mod actions
    let pageIndex;
    if (req.params.pageIndex) {
        pageIndex = req.params.pageIndex;
        if (pageIndex < 0) {
            pageIndex = 0;
        }

        const logs = [];

        const NUM_OF_RESULTS_PER_PAGE = 10;
        // Page 0 is the first page.
        const skipNumber = pageIndex * NUM_OF_RESULTS_PER_PAGE;

        ModLog.find({})
            .sort({ dateCreated: 'descending' })
            .skip(skipNumber)
            .limit(NUM_OF_RESULTS_PER_PAGE)
            .exec(async (err, logs) => {
                if (err) { console.log(err); } 
                else {
                    res.status(200).send(logs);
                }
            });
    }
});

module.exports = router;