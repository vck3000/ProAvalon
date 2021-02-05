const express = require('express');

const router = express.Router();
const url = require('url');
const patreon = require('patreon');
const middleware = require('./middleware');
const User = require('../models/user');
const PatreonId = require('../models/patreonId');
const patreonHelper = require('../myFunctions/patreonHelper');


const patreonAPI = patreon.patreon;
const patreonOAuth = patreon.oauth;

const CLIENT_ID = process.env.patreon_client_ID;
const CLIENT_SECRET = process.env.patreon_client_secret;

const patreonOAuthClient = patreonOAuth(CLIENT_ID, CLIENT_SECRET);

const { patreon_redirectURL } = process.env;


const database = {};

function getPledges(access_token, callback) {
    const apiClient = patreonAPI(access_token);

    // make api requests concurrently
    return apiClient('/current_user')
        .then(({ store, rawJson }) => {
            // var _user = store.find('user', id)
            // var campaign = _user.campaign ? _user.campaign.serialize().data : null
            const data = rawJson.data ? rawJson.data : null;
            const page = oauthExampleTpl({
                name: rawJson.data.attributes.first_name,
                campaigns: [data],
            });

            console.log(rawJson.data.attributes.full_name);
            console.log(rawJson.data.id);
            if (rawJson.included) {
                console.log(rawJson.included[0].attributes.amount_cents);
                console.log(rawJson.included[0].attributes.declined_since);
            }


            // return res.send(page)
        }).catch((err) => {
            const { status, statusText } = err;
            console.log('Failed to retrieve campaign info');
            console.log(err);
            // return res.json({ status, statusText })
        });
}

// getPledges(process.env.myTempToken, (res) => {
//     console.log(JSON.stringify(res));
// })


// var loginUrl = url.format({
//     protocol: 'https',
//     host: 'patreon.com',
//     pathname: '/oauth2/authorize',
//     query: {
//         response_type: 'code',
//         client_id: CLIENT_ID,
//         redirect_uri: patreon_redirectURL,
//         state: 'chill'
//     }
// });

// router.get('/', (req, res) => {
//     res.send(`<a href="${loginUrl}">Login with Patreon</a>`)

//     // <a href="https://www.patreon.com/bePatron?u=15685660" data-patreon-widget-type="become-patron-button">Become a Patron!</a><script async src="https://c6.patreon.com/becomePatronButton.bundle.js"></script>
// });

router.get('/oauth/redirect', (req, res) => {
    const { code } = req.query;
    let token;
    console.log('HIHI');
    if (!req.user) {
        req.flash('error', 'Please sign in to link your patreon account.');
        res.redirect('/');
    }

    return patreonOAuthClient.getTokens(code, patreon_redirectURL)
        .then(({ access_token }) => {
            token = access_token; // eslint-disable-line camelcase
            const apiClient = patreonAPI(token);
            return apiClient('/current_user');
        })
        .then(async ({ store, rawJson }) => {
            const { id } = rawJson.data;
            database[id] = { ...rawJson.data, token };

            // console.log(rawJson.data.attributes.full_name)
            // console.log(rawJson.data.id)
            // console.log(JSON.stringify(rawJson))
            // if (rawJson.included) {
            //     console.log(rawJson.included[0].attributes.amount_cents)
            //     console.log(rawJson.included[0].attributes.declined_since)
            // }

            const patreon_full_name = rawJson.data.attributes.full_name;
            const patreon_id = rawJson.data.id;
            const patreon_amount_cents = rawJson.included ? rawJson.included[0].attributes.amount_cents : undefined;
            const patreon_declined_since = rawJson.included ? rawJson.included[0].attributes.declined_since : undefined;


            function addDays(date, days) {
                const result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            }


            return PatreonId.findOne({ id: patreon_id })
                .exec(async (err, patreonIdObj) => {
                    // If the patreonId doesn't exist, create it.
                    if (err) { console.log(err); } else {
                        // console.log(patreonIdObj);

                        if (!patreonIdObj) {
                            console.log("Patreon ID doesn't exist in database. Creating...");
                            await PatreonId.create({
                                name: patreon_full_name,
                                token,
                                id: patreon_id,
                                amount_cents: patreon_amount_cents,
                                declined_since: patreon_declined_since,
                                expires: addDays(new Date(), 32), // lasts for 32 days before needs a refresh
                                in_game_username: req.user.username,
                            })
                                .then((obj) => {
                                    console.log('Created Patreon ID. Now linking with user...');
                                    req.user.patreonId = patreon_id;
                                    req.user.markModified('patreonId');
                                    return req.user.save();
                                })
                                .then((obj) => {
                                    console.log('Successfully linked up user and Patreon!');
                                    req.flash('success', 'Success! Your account has now been linked! Please re-log in again to see the changes.');
                                });
                        } else {
                            console.log('Patreon ID exists. Checking expired...');

                            console.log('Updating token... (should do this every time)');
                            patreonIdObj.token = token;
                            patreonIdObj.markModified('token');
                            await patreonIdObj.save()
                                .then((obj) => {
                                    console.log("Successfully updated patreonId's token.");
                                });

                            if (new Date() < new Date(patreonIdObj.expires)) {
                                console.log('Patreon ID is not expired. Updating details.');
                                patreonIdObj.amount_cents = patreon_amount_cents;
                                patreonIdObj.markModified('amount_cents');
                                await patreonIdObj.save();

                                req.flash('success', 'This Patreon ID has not expired and is already linked with an account. Its details have been updated however.');
                            } else {
                                console.log('Patreon ID is expired. Updating...');
                                PatreonId.findOneAndReplace({ id: patreon_id }, {
                                    name: patreon_full_name,
                                    token,
                                    id: patreon_id,
                                    amount_cents: patreon_amount_cents,
                                    declined_since: patreon_declined_since,
                                    expires: addDays(new Date(), 32), // lasts for 32 days before it needs a refresh
                                    in_game_username: req.user.username,
                                })
                                    .then((obj) => {
                                        console.log('Updated successfully.');
                                        req.flash('success', 'Success! Your account has now been updated! Please log in again to see the changes.');
                                    });
                            }
                        }
                    }
                    return res.redirect(`/profile/${req.user.username}`);
                });
        })

        .catch((err) => {
            console.log(err);
            req.flash('error', 'Something went terribly wrong... :(');
            res.redirect('/profile/${req.user.username}');
        });
});


// router.get('/protected/:id', (req, res) => {
//     var { id } = req.params

//     // load the user from the database
//     var user = database[id]
//     if (!user || !user.token) {
//         return res.redirect('/')
//     }
//     // var user = {};
//     // user.token = process.env.myTempToken

//     var apiClient = patreonAPI(user.token)

//     console.log("Token: " + user.token);

//     // make api requests concurrently
//     apiClient('/current_user')
//         .then(({ store, rawJson }) => {
//             // var _user = store.find('user', id)
//             // console.log(JSON.stringify(rawJson))
//             // var campaign = _user.campaign ? _user.campaign.serialize().data : null
//             var data = rawJson.data ? rawJson : null
//             var page = oauthExampleTpl({
//                 name: rawJson.data.attributes.first_name,
//                 campaigns: [data]
//             })
//             return res.send(page)
//         }).catch((err) => {
//             var { status, statusText } = err
//             console.log('Failed to retrieve campaign info')
//             console.log(err)
//             return res.json({ status, statusText })
//         })
// });


// function oauthExampleTpl({ name, campaigns }) {
//     return `
// <!DOCTYPE html>
// <html>
//     <head>
//         <meta charset="utf-8">
//         <title>OAuth Results</title>
//         <style>
//             .container {
//                 max-width: 800px;
//                 margin: auto;
//             }
//             .jsonsample {
//                 max-height: 500px;
//                 overflow: auto;
//                 margin-bottom: 60px;
//                 border-bottom: 1px solid #ccc;
//             }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <h1>Welcome, ${name}!</h1>
//             <p>Thank you for helping me gather some data. In case you were interested, below is all the info I get to see off your profile:</p>
//             <div class="jsonsample">${JSON.stringify(campaigns)}</div>
//         </div>
//     </body>
// </html>`
// }


module.exports = router;
