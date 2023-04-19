import room from 'src/gameplay/Room';


export class SeeMerlinInfoComponent {
    private merlin: string;
    private role: string;
    private isEnabled: boolean;
    private room: room;

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
        
        playerList: Entity[] = room.claimingPlayers;

        spyList: Engity[] = [];

        if(room.gamePlayerLeftDuringReady == true) {

            for (let i = 0; i < playerList.length; i++) {
                if (playerList[i].alliance === 'Spy') {
                  if (this.thisRoom.playersInGame[i].role === 'Mordred') {
                    // don't add mordred for Merlin to see
                  } else {
                    // add the spy
                    array.push(this.thisRoom.playersInGame[i].username);
                  }
                }
              }

        }
    }
}