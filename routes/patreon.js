var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var User = require("../models/user");
var patreonInfoTemp = require("../models/patreonInfoTemp");
var patreonHelper = require("../myFunctions/patreonHelper");

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

function getPledges(access_token, callback) {

    var apiClient = patreonAPI(access_token);

    // make api requests concurrently
    return apiClient('/current_user')
        .then(({ store, rawJson }) => {
            // var _user = store.find('user', id)
            // var campaign = _user.campaign ? _user.campaign.serialize().data : null
            var data = rawJson.data ? rawJson.data : null
            var page = oauthExampleTpl({
                name: rawJson.data.attributes.first_name,
                campaigns: [data]
            })

            console.log(rawJson.data.attributes.full_name)
            console.log(rawJson.data.id)
            if (rawJson.included) {
                console.log(rawJson.included[0].attributes.amount_cents)
                console.log(rawJson.included[0].attributes.declined_since)
            }


            // return res.send(page)
        }).catch((err) => {
            var { status, statusText } = err
            console.log('Failed to retrieve campaign info')
            console.log(err)
            // return res.json({ status, statusText })
        })
}

// getPledges(process.env.myTempToken, (res) => {
//     console.log(JSON.stringify(res));
// })


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
            // console.log(`Saved user ${store.find('user', id).full_name} to the database`)
            // console.log(`${JSON.stringify(database[id], null, 6)}`)
            // console.log(`${store.find}`)

            console.log(rawJson.data.attributes.full_name)
            console.log(rawJson.data.id)
            console.log(JSON.stringify(rawJson))
            if (rawJson.included) {
                console.log(rawJson.included[0].attributes.amount_cents)
                console.log(rawJson.included[0].attributes.declined_since)
            }

            let patreon_full_name = rawJson.data.attributes.full_name;
            let patreon_id = rawJson.data.id;
            let patreon_amount_cents = rawJson.included ? rawJson.included[0].attributes.amount_cents : undefined;
            let patreon_declined_since = rawJson.included ? rawJson.included[0].attributes.declined_since : undefined;


            patreonInfoTemp.create({
                name: store.find('user', id).full_name,
                serialized: JSON.stringify(database[id], null, 6),
                token: token,

                patreon_full_name: patreon_full_name,
                patreon_id: patreon_id,
                patreon_amount_cents: patreon_amount_cents,
                patreon_declined_since: patreon_declined_since
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
    // var user = {};
    // user.token = process.env.myTempToken

    var apiClient = patreonAPI(user.token)

    console.log("Token: " + user.token);

    // make api requests concurrently
    apiClient('/current_user')
        .then(({ store, rawJson }) => {
            // var _user = store.find('user', id)
            // console.log(JSON.stringify(rawJson))
            // var campaign = _user.campaign ? _user.campaign.serialize().data : null
            var data = rawJson.data ? rawJson : null
            var page = oauthExampleTpl({
                name: rawJson.data.attributes.first_name,
                campaigns: [data]
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
            <div class="jsonsample">${JSON.stringify(campaigns)}</div>
        </div>
    </body>
</html>`
}






module.exports = router;
