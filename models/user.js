var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatarImgRes: String,
	avatarImgSpy: String
});


UserSchema.plugin(passportLocalMongoose,


	/*, {usernameLowerCase: true}*/
	{
		// findByUsername: function (model, queryParameters) {
		// 	// Add additional query parameter - AND condition - active: true
		// 	queryParameters.active = true;
		// 	return model.findOne(queryParameters);
		// }


	}

);

module.exports = mongoose.model("User", UserSchema);

