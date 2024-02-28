const obj = {};

obj.getIndexFromUsername = function (sockets, username) {
  for (let i = 0; i < sockets.length; i++) {
    if (
      username.toLowerCase() === sockets[i].request.user.username.toLowerCase()
    ) {
      return i;
    }
  }

  return -1;
};

export default obj;
