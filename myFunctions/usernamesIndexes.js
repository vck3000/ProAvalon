const obj = {};


obj.getIndexFromUsername = function (sockets, username) {
    for (let i = 0; i < sockets.length; i++) {
        if (username === sockets[i].request.user.username) {
            return i;
        }
    }

    return -1;
};

obj.getUsernameFromIndex = function (usernames, index) {
    return usernames[index].username;
};


module.exports = obj;
