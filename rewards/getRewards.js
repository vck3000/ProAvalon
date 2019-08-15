const PatreonId = require('../models/patreonId');
const indexRewards = require('./indexRewards');

indexRewardsObj = new indexRewards();

const modsArray = require('../modsadmins/mods');
const adminsArray = require('../modsadmins/admins');


class GetRewards {
    constructor() {
        this.allRewards = indexRewardsObj.getAllRewards();
    }

    mainTest() {
        console.log(this.allRewards);
    }

    async userHasReward(user, reward, patreonDetails) {
        if (!patreonDetails) {
            console.log('Getting patreon details...');

            await PatreonId.find({ id: user.patreonId })
                .exec()
                .then((obj) => {
                    patreonDetails = obj;
                    console.log('Gotten patreon details.');
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            console.log('Was given patreon details');
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
        if (reward.donationReq !== 0 && (
            // Payment has been declined
            patreonDetails.declined_since !== null

            // Payment is not high enough
            || patreonDetails.amount_cents < reward.donationReq

            // Username linked is not the current user
            || patreonDetails.in_game_username.toLowerCase() !== user.username.toLowerCase()

            // Passed the 32 day valid period
            || new Date() > new Date(patreonDetails.expires))
        ) {
            // Fail case.
            return false;
        }

        // If we pass all the above, this reward has been satisfied.
        return true;
    }

    async getAllRewardsForUser(user) {
        const rewardsSatisfied = [];

        let patreonDetails;

        console.log(user.patreonId);
        await PatreonId.findOne({ id: user.patreonId })
            .exec()
            .then((obj) => {
                patreonDetails = obj;
                console.log('Gotten patreon details.');
            })
            .catch((err) => {
                console.log(err);
            });

        console.log('Starting checks. This should happen AFTER we have patreon details.');

        for (const key in this.allRewards) {
            if (this.allRewards.hasOwnProperty(key)) {
                const hasReward = await this.userHasReward(user, this.allRewards[key], patreonDetails);
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
