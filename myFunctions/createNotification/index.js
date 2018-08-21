var User 			= require("../../models/user");
var myNotification	= require("../../models/notification");
var mongoose 		= require("mongoose");



createNotifObj = {};



createNotifObj.createNotification = function(userIDTarget, stringToSay, link){
	if(userIDTarget){
		User.findById(mongoose.Types.ObjectId(userIDTarget)).populate("notifications")
		.exec(function(err, foundUser){

			console.log(foundUser.username);

		if(err){
			console.log(err);
		}
		else{
			if(foundUser){
				//check if the user already has the exact same notification, check by the link.
				//mainly for duplicate likes.
				var sameNotifExists = false;
				// console.log("String to say: " + stringToSay);
				for(var i = 0; i < foundUser.notifications.length; i++){
					//if its the same link, and the same notification text
					if(foundUser.notifications[i].link === link && foundUser.notifications[i].text === stringToSay){
						sameNotifExists = true;
						break;
					}
				}

				// console.log("sameNotifExists: " + sameNotifExists);

				//if the notification is for the person who made it (i.e. If I comment on my own post)
				if(stringToSay.includes(foundUser.username) === false && sameNotifExists === false){

					notificationVar = {
						text: stringToSay,
						date: new Date(),
						link: link,
		
						forPlayer: foundUser.username,
						seen: false
					}
					
						myNotification.create(notificationVar, function(err, newNotif){
							// console.log(foundUser);
							if(foundUser.notifications){
								foundUser.notifications.push(newNotif);
								foundUser.markModified("notifications");
								foundUser.save();
							}
						});
					}
				}
			}
		});
	}
}


module.exports = createNotifObj;