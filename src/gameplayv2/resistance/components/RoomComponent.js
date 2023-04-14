//extends component

import { max } from "moment";

//define a class for room component
export class RoomComponent{
    constructor(roomId, host, io, maxNumPlayers, roomPass, gameMode, ranked){
        //check if roompass is not set
        if (roomPass === ''){
            roomPass = undefined;
        }
        //make sure that the num of players stay within the pool
        if (maxNumPlayers < 5){
            maxNumPlayers = 5;
        } else if (maxNumPlayers > 10) {
            maxNumPlayers = 10;
        }

        this.roomId = roomId;
        this.host = host;
        this.id = id;
        this.maxNumPlayers = maxNumPlayers;
        this.roomPass = roomPass;
        this.gameMode = gameMode;
        this.ranked = ranked;
    }
}