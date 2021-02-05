const mongoose = require('mongoose');
const User = require('../../models/user');
const myNotification = require('../../models/notification');


createNotifObj = {};


createNotifObj.createNotification = function (userIDTarget, stringToSay, link, madeBy) {
    if (userIDTarget && madeBy) {
        User.findById(mongoose.Types.ObjectId(userIDTarget)).populate('notifications')
            .exec((err, foundUser) => {
                if (err) {
                    console.log(err);
                } else if (foundUser) {
                    // check if the user already has the exact same notification, check by the link.
                    // mainly for duplicate likes.
                    let sameNotifExists = false;
                    // console.log("String to say: " + stringToSay);
                    for (let i = 0; i < foundUser.notifications.length; i++) {
                        // if its the same link, and the same notification text
                        if (foundUser.notifications[i].link === link && foundUser.notifications[i].text === stringToSay) {
                            sameNotifExists = true;
                            break;
                        }
                    }

                    // console.log("sameNotifExists: " + sameNotifExists);

                    // if the notification is for the person who made it (i.e. If I comment on my own post)
                    if (madeBy.toLowerCase() !== foundUser.username.toLowerCase() && sameNotifExists === false) {
                        notificationVar = {
                            text: stringToSay,
                            date: new Date(),
                            link,

                            forPlayer: foundUser.username,
                            seen: false,

                            madeBy: madeBy.toLowerCase(),
                        };

                        myNotification.create(notificationVar, (err, newNotif) => {
                            // console.log(foundUser);
                            if (foundUser.notifications) {
                                foundUser.notifications.push(newNotif);

                                const maxNumNotifs = 20;
                                if (foundUser.notifications.length > maxNumNotifs) {
                                    foundUser.notifications = foundUser.notifications.slice(foundUser.notifications.length - maxNumNotifs, foundUser.notifications.length);
                                }

                                // console.log(foundUser.notifications);
                                // console.log(foundUser.notifications.length);
                                foundUser.markModified('notifications');
                                foundUser.save();
                            }
                        });
                    }
                }
            });
    } else {
        console.log(`Missing a parameter - userIDTarget: ${userIDTarget}\tmadeBy: ${madeBy}`);
    }
};


module.exports = createNotifObj;
