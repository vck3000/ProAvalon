const { Router } = require('express');
const User = require('../models/user');
const defaultValuesForUser = require('../models/defaultValuesForUser');
const checkIpBan = require('./checkIpBan');
const modsArray = require('../modsadmins/mods');

const router = new Router();

// lobby route
router.get('/', checkIpBan, async (req, res) => {
    // console.log(res.app.locals.originalUsername);
    User.findOne({ username: req.user.username }).populate('notifications').exec(async (err, foundUser) => {
        if (err) {
            // res.render("lobby", {currentUser: req.user, headerActive: "lobby", userNotifications: [{text: "There was a problem loading your notifications.", optionsCog: true}] });
            console.log(err);
            req.flash('error', 'Something has gone wrong! Please contact a moderator or admin.');
            res.redirect('/');
        } else {
            const isMod = req.isAuthenticated() && modsArray.indexOf(req.user.username.toLowerCase()) !== -1;

            res.render('lobby', {
                currentUser: req.user,
                headerActive: 'lobby',
                userNotifications: foundUser.notifications,
                optionsCog: true,
                isMod,
            });

            // check that they have all the default values.
            for (const keys in defaultValuesForUser) {
                if (defaultValuesForUser.hasOwnProperty(keys)) {
                    // if they don't have a default value, then give them a default value.
                    if (!foundUser[keys]) {
                        foundUser[keys] = defaultValuesForUser[keys];
                    }
                }
            }
            foundUser.save();
        }
    });
});

module.exports = router;
