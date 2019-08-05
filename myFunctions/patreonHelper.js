var patreon = require("patreon");
var patreonAPI = patreon.patreon;

var PatreonHelper = {};

PatreonHelper.classFunctionTest = function () {
    console.log("Class function")
}

PatreonHelper.getUserStore = function (token) {
    let apiClient = patreonAPI(token)


    return apiClient('/current_user')
        .then(({ store, rawJson }) => {
            var { id } = rawJson.data
            // database[id] = { ...rawJson.data, token }
            console.log(`Saved user ${store.find('user', id).full_name} to the database`)
            // console.log(`${JSON.stringify(database[id], null, 6)}`)

            console.log(`Got ID: ${id}, for name: ${store.find('user', id).full_name}.`)

            return rawJson.data
        })
}




module.exports = PatreonHelper;