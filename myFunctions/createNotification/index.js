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
			notificationVar = {
				text: stringToSay,
				date: new Date(),
				link: link,

				forPlayer: foundUser.username,
				seen: false
			}
			// if(foundUser){
				myNotification.create(notificationVar, function(err, newNotif){
					// console.log(foundUser);
					if(foundUser.notifications){
						foundUser.notifications.push(newNotif);
						foundUser.markModified("notifications");
						foundUser.save();
					}
				});
			// }
			}
		});
	}
}


module.exports = createNotifObj;