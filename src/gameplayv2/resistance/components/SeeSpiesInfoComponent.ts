import Game from "../../Game";
// import {Entity} from "../../resistance/entities/Entity";

export class SeeSpiesInfoComponent {
    private player: string;
    private allSpies: string[];
    private isEnabled: boolean;
    protected thisRoom: Game;
    // protected spyList: Entity[] = [];

    constructor(player: string, isEnabled: boolean, thisroom: Game, allSpies: string[]) {
        this.player = player;
        this.isEnabled = isEnabled;
        this.thisRoom = thisroom;
        this.allSpies = allSpies;
    }

    getPlayer(): string {
        return this.player;
    }

    setPlayer(newPlayer: string): void {
        this.player = newPlayer;
    }

    //getters and setters for role that is being viewed by Merlin
    getAllSpies(): string[] {
        return this.allSpies;
    }

    setAllSpies(allSpies: string[]): void {
        this.allSpies = allSpies;
    }

    getEnabled(): boolean {
        return this.isEnabled;
    }

    setEnabled(newEnabled: boolean): void {
        this.isEnabled = newEnabled;
    }

    seeSpies(){
        

        if(this.thisRoom.gameStarted === true) {

            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].alliance === 'Spy') {
                  if (this.thisRoom.playersInGame[i].role === 'Mordred') {
                    // don't add mordred for Merlin to see
                  } else {
                    // add the spy
                    this.allSpies.push(this.thisRoom.playersInGame[i].username);
                  }
                }
              }

        }

        return this.allSpies
    }
}