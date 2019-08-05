var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var User = require("../models/user");
var patreonInfoTemp = require("../models/patreonInfoTemp");


// //Show the mod approving rejecting page
// router.get("/avatargetlinktutorial", middleware.isLoggedIn, function (req, res) {
// 	res.render("profile/avatargetlinktutorial");
// });


// //Show the mod approving rejecting page
// router.get("/mod/customavatar", middleware.isMod, function (req, res) {
// 	avatarRequest.find({ processed: false }).exec(function (err, allAvatarRequests) {
// 		if (err) { console.log(err); }
// 		else {
// 			res.render("mod/customavatar", { customAvatarRequests: allAvatarRequests });
// 		}
// 	});
// });

var url = require("url")
var patreon = require("patreon");
var patreonAPI = patreon.patreon;
var patreonOAuth = patreon.oauth;

var CLIENT_ID = process.env.patreon_client_ID;
var CLIENT_SECRET = process.env.patreon_client_secret;

var patreonOAuthClient = patreonOAuth(CLIENT_ID, CLIENT_SECRET);

var redirectURL;
if (process.env.MY_PLATFORM === "local") {
    redirectURL = 'http://127.0.0.1/patreon/oauth/test_redirect';
}
else if (process.env.MY_PLATFORM === "staging") {
    redirectURL = 'https://proavalonbetatesting-pr-222.herokuapp.com/patreon/oauth/test_redirect';
}
else {
    // TODO
}

let database = {}

var loginUrl = url.format({
    protocol: 'https',
    host: 'patreon.com',
    pathname: '/oauth2/authorize',
    query: {
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: redirectURL,
        state: 'chill'
    }
});

router.get('/', (req, res) => {
    res.send(`<a href="${loginUrl}">Login with Patreon</a>`)
});

router.get('/oauth/test_redirect', (req, res) => {
    var { code } = req.query
    let token

    return patreonOAuthClient.getTokens(code, redirectURL)
        .then(({ access_token }) => {
            token = access_token // eslint-disable-line camelcase
            var apiClient = patreonAPI(token)
            return apiClient('/current_user')
        })
        .then(({ store, rawJson }) => {
            var { id } = rawJson.data
            database[id] = { ...rawJson.data, token }
            console.log(`Saved user ${store.find('user', id).full_name} to the database`)
            console.log(`${JSON.stringify(database[id], null, 6)}`)

            patreonInfoTemp.create({
                name: store.find('user', id).full_name,
                serialized: JSON.stringify(database[id], null, 6),
                token: token
            })

            return res.redirect(`/patreon/protected/${id}`)
        })
        .catch((err) => {
            console.log(err)
            console.log('Redirecting to login')
            res.redirect('/')
        })
});


router.get('/protected/:id', (req, res) => {
    var { id } = req.params

    // load the user from the database
    var user = database[id]
    if (!user || !user.token) {
        return res.redirect('/')
    }
    // 15685660
    // 15685660

    // 57pdyH4AhRp7fGOJOyoBH6r9Cjfjrh0wzpWtq3hXkV8
    // 4CCBCeX34semL9QBSW2NX7K_VoJ0D6BnJvu9pQRKm3E


    var apiClient = patreonAPI(user.token)

    console.log("Token: " + user.token);

    // make api requests concurrently
    apiClient('/current_user/campaigns')
        .then(({ store }) => {
            var _user = store.find('user', id)
            // var campaign = _user.campaign ? _user.campaign.serialize().data : null
            var campaign = _user ? _user.serialize().data : null
            var page = oauthExampleTpl({
                name: _user.first_name,
                campaigns: [campaign]
            })
            return res.send(page)
        }).catch((err) => {
            var { status, statusText } = err
            console.log('Failed to retrieve campaign info')
            console.log(err)
            return res.json({ status, statusText })
        })
});



function oauthExampleTpl({ name, campaigns }) {
    return `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>OAuth Results</title>
        <style>
            .container {
                max-width: 800px;
                margin: auto;
            }
            .jsonsample {
                max-height: 500px;
                overflow: auto;
                margin-bottom: 60px;
                border-bottom: 1px solid #ccc;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome, ${name}!</h1>
            <p>Thank you for helping me gather some data. In case you were interested, below is all the info I get to see off your profile:</p>
            <div class="jsonsample">${JSON.stringify(campaigns, null, 4)}</div>
        </div>
    </body>
</html>`
}






module.exports = router;
