import Role from "./role";

export default class Resistance extends Role {
    constructor(thisRoom) {
        super(thisRoom, "Resistance", "Resistance", "A standard Resistance member.");
    }

    see() {
        return undefined;
    }
}
