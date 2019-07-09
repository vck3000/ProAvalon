const Phase = require("../../commonPhases/phase");

class HunterTestPhase extends Phase {
    constructor(thisRoom) {
        super(thisRoom, "hunterTestPhase", true);
    }
}

module.exports = HunterTestPhase;
