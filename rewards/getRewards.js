const indexRewards = require("./indexRewards");
indexRewardsObj = new indexRewards();

class index {
    mainTest() {
        console.log(JSON.stringify(indexRewardsObj.getAllRewards()));
    }
}

module.exports = index;


