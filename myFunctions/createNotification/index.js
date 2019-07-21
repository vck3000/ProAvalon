var User = require("../../models/user");
var myNotification = require("../../models/notification");
var mongoose = require("mongoose");



createNotifObj = {};



createNotifObj.createNotification = function (userIDTarget, stringToSay, link, madeBy) {
	if (userIDTarget && madeBy) {
		User.findById(mongoose.Types.ObjectId(userIDTarget)).populate("notifications")
			.exec(function (err, foundUser) {


				if (err) {
					console.log(err);
				}
				else {
					if (foundUser) {
						//check if the user already has the exact same notification, check by the link.
						//mainly for duplicate likes.
						var sameNotifExists = false;
						// console.log("String to say: " + stringToSay);
						for (var i = 0; i < foundUser.notifications.length; i++) {
							//if its the same link, and the same notification text
							if (foundUser.notifications[i].link === link && foundUser.notifications[i].text === stringToSay) {
								sameNotifExists = true;
								break;
							}
						}

						// console.log("sameNotifExists: " + sameNotifExists);

						//if the notification is for the person who made it (i.e. If I comment on my own post)
						if (madeBy.toLowerCase() !== foundUser.username.toLowerCase() && sameNotifExists === false) {

							notificationVar = {
								text: stringToSay,
								date: new Date(),
								link: link,

								forPlayer: foundUser.username,
                                seen: false,
                                
                                madeBy: madeBy.toLowerCase()
							}

							myNotification.create(notificationVar, function (err, newNotif) {
								// console.log(foundUser);
								if (foundUser.notifications) {
                                    foundUser.notifications.push(newNotif);

                                    var maxNumNotifs = 20;
                                    if(foundUser.notifications.length > maxNumNotifs){
                                        foundUser.notifications = foundUser.notifications.slice(foundUser.notifications.length - maxNumNotifs, foundUser.notifications.length)
                                    }

                                    console.log(foundUser.notifications);
                                    console.log(foundUser.notifications.length);
									foundUser.markModified("notifications");
									foundUser.save();
                                }
							});
						}
					}
				}
			});
    }
    else{
        console.log("Missing a parameter - userIDTarget: " + userIDTarget + "\tmadeBy: " + madeBy);
    }
}


module.exports = createNotifObj;