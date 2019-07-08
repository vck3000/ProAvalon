import Role from "./role";

export default class Isolde extends Role {
    constructor(thisRoom) {
        super(thisRoom, "Isolde", "Resistance", "Tristan and Isolde both see each other.", 50);
    }

    see() {
        const roleTag = {};

        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
            if (this.thisRoom.playersInGame[i].role === "Tristan") {
                roleTag[this.thisRoom.playersInGame[i].username] = {};
                roleTag[this.thisRoom.playersInGame[i].username].roleTag = "Tristan";
            }
        }

        return roleTag;
    }
}
