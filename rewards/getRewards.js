const PatreonId = require("../models/patreonId");
const indexRewards = require("./indexRewards");
indexRewardsObj = new indexRewards();

const modsArray = require("../modsadmins/mods");
const adminsArray = require("../modsadmins/admins");



class GetRewards {
    constructor() {
        this.allRewards = indexRewardsObj.getAllRewards();
    }
    mainTest() {
        console.log(this.allRewards);
    }

    async getAllRewardsForUser(user) {
        var rewardsSatisfied = [];

        let patreonDetails;

        await PatreonId.find({ "id": user.patreonId })
            .exec()
            .then(obj => {
                patreonDetails = obj;
                console.log("Gotten patreon details.")
            })
            .catch(err => {
                console.log(err);
            })

        console.log("Starting checks. This should happen AFTER we have patreon details.");

        for (var key in this.allRewards) {
            if (this.allRewards.hasOwnProperty(key)) {

                let reward = this.allRewards[key];

                // Check for admin
                if (reward.adminReq === true && adminsArray.indexOf(user.username.toLowerCase()) === -1) {
                    // Fail case.
                    continue;
                }

                // Check for mod
                if (reward.modReq === true && modsArray.indexOf(user.username.toLowerCase()) === -1) {
                    // Fail case.
                    continue;
                }

                // Check for games played
                if (reward.gamesPlayedReq !== 0 && user.totalGamesPlayed < reward.gamesPlayedReq) {
                    // Fail case.
                    continue;
                }


                // Check for patreon donations
                // TODO Test this logic
                if (reward.donationReq !== 0 && (patreonDetails.declined_since !== null || patreonDetails.amount_cents < reward.donationReq)) {
                    // Fail case.
                    continue;
                }

                rewardsSatisfied.push(key);
            }
        }

        console.log(`${user.username} has the following rewards:`);
        console.log(rewardsSatisfied);
        return rewardsSatisfied;
    }
}

module.exports = GetRewards;


