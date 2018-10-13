var obj = {};


obj.getIndexFromUsername = function(sockets, username) {
	for (var i = 0; i < sockets.length; i++) {
		if (username === sockets[i].request.user.username) {
			return i;
		}
	}
}

obj.getUsernameFromIndex = function(usernames, index) {
	return usernames[index].username;
}


module.exports = obj;