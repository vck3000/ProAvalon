const { Router } = require('express');
const router = new Router();
const { isMod } = require('./middleware');
const modAction = require('../models/modAction'); //! Remove this later
const multer = require('multer');
const upload = multer();

router.post('/ban', upload.none(), (req, res) => {
    // res.status(404);
    // res.send('None shall pass');
    console.log("Ban POST");
    console.log(req.body);

    res.status(200);
    res.send("You've reached the ban POST route.");
    

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

        modAction.find({})
            .sort({ whenMade: 'descending' })
            .skip(skipNumber)
            .limit(NUM_OF_RESULTS_PER_PAGE)
            .exec(async (err, foundModActions) => {
                if (err) { console.log(err); } else {
                    logsObj = [];
                    await foundModActions.forEach((action) => {
                        stringsArray = [];
                        switch (action.type) {
                            case 'ban':
                                stringsArray[0] = (`${action.modWhoBanned.username} has banned ${action.bannedPlayer.username}`);
                                stringsArray[0] += ` for reason: ${action.reason}.`;


                                stringsArray.push(`The ban was made on ${action.whenMade}`);
                                stringsArray.push(`The ban will be released on: ${action.whenRelease}`);
                                stringsArray.push(`Moderator message: ${action.descriptionByMod}`);
                                break;
                            case 'mute':
                                stringsArray[0] = (`${action.modWhoBanned.username} has muted ${action.bannedPlayer.username}`);
                                stringsArray[0] += ` for reason: ${action.reason}.`;


                                stringsArray.push(`The mute was made on ${action.whenMade}`);
                                // -1970 years because thats the start of computer time
                                stringsArray.push(`The mute will be released on: ${action.whenRelease}`);
                                stringsArray.push(`Moderator message: ${action.descriptionByMod}`);
                                break;
                            // Forum remove
                            case 'remove':
                                stringsArray[0] = `${action.modWhoBanned.username} removed ${action.bannedPlayer.username}'s ${action.elementDeleted}.`;
                                stringsArray[0] += ` Reason: ${action.reason}.`;

                                stringsArray[1] = `The removal occured on ${action.whenMade}`;
                                stringsArray[2] = `Moderator message: ${action.descriptionByMod}`;

                                // Get the extra link bit (The # bit to select to a specific comment/reply)
                                linkStr = '';
                                if (action.elementDeleted === 'forum') {
                                    // Dont need the extra bit here
                                } else if (action.elementDeleted == 'comment') {
                                    linkStr == `#${action.idOfComment}`;
                                } else if (action.elementDeleted == 'reply') {
                                    linkStr == `#${action.idOfReply}`;
                                }

                                stringsArray[3] = `The link to the article is: <a href='/forum/show/${action.idOfForum}${linkStr}'>Here</a>`;
                                break;
                        }

                        const log = {};
                        log.stringsArray = stringsArray;
                        log.date = action.whenMade;

                        logsObj.push(log);
                    });

                    const obj = {};
                    obj.logs = logsObj;

                    // sort in newest to oldest
                    // obj.logs.sort(compareLogObjs);

                    res.status(200).send(obj);
                }
            });
    }
});

// socket.on('modAction', async (data) => {
//     if (modsArray.indexOf(socket.request.user.username.toLowerCase()) !== -1) {
//         // var parsedData = JSON.parse(data);
//         const newModAction = {};
//         let userNotFound = false;

//         await data.forEach(async (item) => {
//             if (item.name === 'banPlayerUsername') {
//                 // not case sensitive
//                 await User.findOne({ usernameLower: item.value.toLowerCase() }, (err, foundUser) => {
//                     if (err) { console.log(err); } else {
//                         // foundUser = foundUser[0];
//                         if (!foundUser) {
//                             socket.emit('messageCommandReturnStr', { message: 'User not found. Please check spelling and caps.', classStr: 'server-text' });
//                             userNotFound = true;
//                             return;
//                         }
//                         // console.log(foundUser);
//                         newModAction.bannedPlayer = {};
//                         newModAction.bannedPlayer.id = foundUser._id;
//                         newModAction.bannedPlayer.username = foundUser.username;
//                         newModAction.bannedPlayer.usernameLower = foundUser.usernameLower;

//                         socket.emit('messageCommandReturnStr', { message: 'User found, Adding in details...\t', classStr: 'server-text' });
//                     }
//                 });
//             } else if (item.name === 'typeofmodaction') {
//                 newModAction.type = item.value;
//             } else if (item.name === 'reasonofmodaction') {
//                 newModAction.reason = item.value;
//             } else if (item.name === 'durationofmodaction') {
//                 const oneSec = 1000;
//                 const oneMin = oneSec * 60;
//                 const oneHr = oneMin * 60;
//                 const oneDay = oneHr * 24;
//                 const oneMonth = oneDay * 30;
//                 const oneYear = oneMonth * 12;
//                 // 30 min, 3hr, 1 day, 3 day, 7 day, 1 month
//                 const durations = [
//                     oneMin * 30,
//                     oneHr * 3,
//                     oneDay,
//                     oneDay * 3,
//                     oneDay * 7,
//                     oneMonth,
//                     oneMonth * 6,
//                     oneYear,
//                     oneYear * 1000,
//                 ];
//                 newModAction.durationToBan = new Date(durations[item.value]);
//             } else if (item.name === 'descriptionByMod') {
//                 newModAction.descriptionByMod = item.value;
//             }
//         });

//         if (userNotFound === true) {
//             return;
//         }

//         await User.findById(socket.request.user.id, (err, foundUser) => {
//             if (err) { console.log(err); } else {
//                 newModAction.modWhoBanned = {};
//                 newModAction.modWhoBanned.id = foundUser._id;
//                 newModAction.modWhoBanned.username = foundUser.username;
//             }
//         });

//         newModAction.whenMade = new Date();
//         newModAction.whenRelease = newModAction.whenMade.getTime() + newModAction.durationToBan.getTime();

//         setTimeout(() => {
//             // console.log(newModAction);
//             if (userNotFound === false && newModAction.bannedPlayer && newModAction.bannedPlayer.username) {
//                 modAction.create(newModAction, (err, newModActionCreated) => {
//                     if (newModActionCreated !== undefined) {
//                         // console.log(newModActionCreated);
//                         // push new mod action into the array of currently active ones loaded.
//                         currentModActions.push(newModActionCreated);
//                         // if theyre online
//                         if (newModActionCreated.type === 'ban' && allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)]) {
//                             allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)].disconnect(true);
//                         } else if (newModActionCreated.type === 'mute' && allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)]) {
//                             allSockets[getIndexFromUsername(allSockets, newModActionCreated.bannedPlayer.username.toLowerCase(), true)].emit('muteNotification', newModActionCreated);
//                         }

//                         socket.emit('messageCommandReturnStr', { message: `${newModActionCreated.bannedPlayer.username} has received a ${newModActionCreated.type} modAction. Thank you :).`, classStr: 'server-text' });
//                     } else {
//                         socket.emit('messageCommandReturnStr', { message: 'Something went wrong...', classStr: 'server-text' });
//                     }
//                 });
//             } else {
//                 let str = 'Something went wrong... Contact the admin! Details: ';
//                 str += `UserNotFound: ${userNotFound}`;
//                 str += `\t newModAction.bannedPlayer: ${newModAction.bannedPlayer}`;
//                 str += `\t newModAction.username: ${newModAction.username}`;
//                 socket.emit('messageCommandReturnStr', { message: str, classStr: 'server-text' });
//             }
//         }, 3000);
//     } else {
//         // create a report. someone doing something bad.
//     }
// });


module.exports = router;