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

    async userHasReward(user, reward, patreonDetails) {

        if (!patreonDetails) {
            console.log("Getting patreon details...");

            await PatreonId.find({ "id": user.patreonId })
                .exec()
                .then(obj => {
                    patreonDetails = obj;
                    console.log("Gotten patreon details.")
                })
                .catch(err => {
                    console.log(err);
                })
        }
        else {
            console.log("Was given patreon details")
        }
        // Check for admin
        if (reward.adminReq === true && !adminsArray.includes(user.username.toLowerCase())) {
            // Fail case.
            return false;
        }

        // Check for mod
        if (reward.modReq === true && !modsArray.includes(user.username.toLowerCase())) {
            // Fail case.
            return false;
        }

        // Check for games played
        if (reward.gamesPlayedReq !== 0 && user.totalGamesPlayed < reward.gamesPlayedReq) {
            // Fail case.
            return false;
        }

        // Check for patreon donations
        if (reward.donationReq !== 0 && (patreonDetails.declined_since !== null || patreonDetails.amount_cents < reward.donationReq)) {
            // Fail case.
            return false;
        }

        return true;

    }

    async getAllRewardsForUser(user) {
        var rewardsSatisfied = [];

        let patreonDetails;

        console.log(user.patreonId);
        await PatreonId.findOne({ "id": user.patreonId })
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
                var hasReward = await this.userHasReward(user, this.allRewards[key], patreonDetails);
                if (hasReward === true) {
                    rewardsSatisfied.push(key);
                }
            }
        }

        console.log(`${user.username} has the following rewards:`);
        console.log(rewardsSatisfied);
        return rewardsSatisfied;
    }
}

module.exports = GetRewards;


