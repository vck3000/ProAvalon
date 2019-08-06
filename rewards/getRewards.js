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
        // console.log(this.allRewards);
    }

    async getRewardsForUser(user) {
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

        console.log("----------------");
        for (var key in this.allRewards) {
            if (this.allRewards.hasOwnProperty(key)) {
                console.log(key);
                console.log(this.allRewards[key]);
                console.log("----------------");

                let reward = this.allRewards[key];

                // Check for admin
                if (reward.adminReq === true && adminsArray.indexOf(user.username) === -1) {
                    // Fail case.
                    continue;
                }

                // Check for mod
                if (reward.modReq === true && modsArray.indexOf(user.username) === -1) {
                    // Fail case.
                    continue;
                }


                // Check for games played
                if (reward.gamesPlayedReq !== 0 && user.gamesPlayed < gamesPlayedReq) {
                    // Fail case.
                    continue;
                }


                // Check for patreon donations
                // TODO INCOMPLETE LOGIC!!! D:
                if (reward.donationReq !== 0 && (patreonDetails.declinedSince !== null || donationReq <= patreonDetails.amount_cents)) {
                    // Fail case.
                    continue;
                }
            }
        }
    }
}

module.exports = GetRewards;


