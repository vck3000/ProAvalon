const Role = require("./role");

module.exports = class Resistance extends Role {
    constructor(thisRoom) {
        super(thisRoom, "Resistance", "Resistance", "A standard Resistance member.");
    }

    see() {
        return undefined;
    }
};
