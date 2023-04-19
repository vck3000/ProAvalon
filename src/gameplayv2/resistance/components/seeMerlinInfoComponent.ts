import room from 'src/gameplay/Room';
import Entity from 'src/entities/Room';

export class SeeMerlinInfoComponent {
    private merlin: string;
    private role: string;
    private isEnabled: boolean;
    private room: room;
    private playerList: Entity[] = room.claimingPlayers;
    private spyList: Entity[] = [];


    constructor(merlin: string, role: string, isEnabled: boolean, thisRoom: room) {
        this.merlin = merlin;
        this.role = role;
        this.isEnabled = isEnabled;
        this.room = thisRoom;
    }

    getPercival(): string {
        return this.merlin;
    }

    setViewer(newMerlin: string): void {
        this.merlin = newMerlin;
    }

    //getters and setters for role that is being viewde by percival
    getRole(): any {
        return this.role;
    }

    setBeingViewed(role: any): void {
        this.role = role;
    }

    getEnabled(): boolean {
        return this.isEnabled;
    }

    setEnabled(newEnabled: boolean): void {
        this.isEnabled = newEnabled;
    }

    verifySee(){
        
        
        // obj: Entity[][] = {};

        if(room.gamePlayerLeftDuringReady == true) {

            for (let i = 0; i < this.playerList.length; i++) {
                if (this.playerList[i].alliance === 'Spy') {
                  if (this.playerList[i].role === 'Mordred') {
                    // don't add mordred for Merlin to see
                  } else {
                    // add the spy
                    this.spyList.push(this.playerList[i].username);
                  }
                }
              }

        }
    }
}