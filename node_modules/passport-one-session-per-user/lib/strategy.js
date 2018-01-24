/**
 * Creates an instance of `Strategy`.
 *
 * @constructor
 * @api public
 */
function Strategy() {
    this.name = 'passport-one-session-per-user'
}

/**
 * Authenticate request.
 *
 * This function must be overridden by subclasses.  In abstract form, it always
 * throws an exception.
 *
 * @param {Object} req The request to authenticate.
 * @param {Object} [options] Strategy-specific options.
 * @api public
 */
var loggedInUsers = []

var passport = require('passport')

Strategy.prototype.authenticate = function(req) {
    var self = this;

    // If there is not logged in user, do nothing.
    if (!req.user) {
        return self.pass()
    }

    // If there is logged in user, let's see if he exists in [loggedInUsers] array
    passport.serializeUser(req.user, function(err, thisUserId) {
        var found = false
        for (var i = 0; i < loggedInUsers.length; i++) {
            if (thisUserId == loggedInUsers[i].user) {
                if (loggedInUsers[i].sessionID != req.sessionID) {
                    //Same user logged in from other session
                    // Flag him to `logout`  next time he request and pge

                    loggedInUsers[i].logout = true;
                } else if (loggedInUsers[i].logout) {
                    // This user flagged to logout. Log him out, and remove this instance from array;
                    found = true
                    loggedInUsers.splice(i, 1)
                    req.logout()
                    return self.pass()
                } else {
                    // this user and this sessionID already in Array.
                    // We don't need to do add him again.
                    found = true
                }
            }
        }

        // If the current session && curred User not in Array. Add it to array
        if (!found) {
            loggedInUsers.push({
                user: thisUserId,
                sessionID: req.sessionID
            })
        }
        self.pass()
    });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
