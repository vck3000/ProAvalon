// import { AVALON, AVALON_BOT, GAME_MODE_NAMES, gameModeObj } from './gameModes';
import usernamesIndexes from '../myFunctions/usernamesIndexes';
import { StringLiteralLike } from 'typescript';

//Initial implementation of room, trying to understand how to best make it efficient by traversing each code one by one
//Still work in progress
export class Room {

    public host_: string;
    public roomId: number;
    public io_: any;
    public maxNumPlayers: number;
    public joinPassword: string;
    public gameMode: string;
    public ranked: boolean;
    public thisRoom = Room;
    public gamesRequiredForRanked: number= 0;
    public provisionalGamesRequired: number = 20;
    public canJoin: boolean = true;
    public gamePlayerLeftDuringReady: boolean = false;
    public kickedPlayers: Entity[] = [];
    public claimingPlayers: Entity[]= [];
    constructor( host_: string, roomId: number, io_: any, maxNumPlayers: number, newRoomPassword: string, gameMode: string, ranked: boolean) {
        const thisRoom = this;
        this.host_ = host_;
        this.roomId = roomId;
        this.io_ = io_;
        this.maxNumPlayers = maxNumPlayers;
        this.joinPassword = newRoomPassword;
        this.gameMode = gameMode;
        this.ranked = ranked;

        if (newRoomPassword === '') {
            newRoomPassword = undefined;
        }

        // Default to 10 if out of range.
        if (maxNumPlayers < 5 || maxNumPlayers > 10) {
            maxNumPlayers = 10;
        }

        // Default value of avalon.
        // if (GAME_MODE_NAMES.includes(this.gameMode) === false) {
        //     this.gameMode = 'avalon';
        // }

    // // Sockets
    // this.allSockets = [];
    // this.socketsOfPlayers = [];
    // this.botSockets = [];

    // // Arrays containing lower cased usernames

    // // Phases Cards and Roles to use
    // this.commonPhases = new commonPhasesIndex().getPhases(thisRoom);
    // this.specialRoles = new gameModeObj[this.gameMode].getRoles(thisRoom);
    // this.specialPhases = new gameModeObj[this.gameMode].getPhases(thisRoom);
    // this.specialCards = new gameModeObj[this.gameMode].getCards(thisRoom);
    }
}
