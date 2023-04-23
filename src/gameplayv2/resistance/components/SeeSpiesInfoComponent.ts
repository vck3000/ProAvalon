export class SeeSpiesInfoComponent {
    private player: string;
    private allSpies: string[];
    private isEnabled: boolean;
    private thisRoom: any;

    constructor(player: string, allSpies: string[], isEnabled: boolean, thisRoom: any) {
        this.player = player;
        this.allSpies = allSpies;
        this.isEnabled = isEnabled;
        this.thisRoom = thisRoom;
    }

    see(): { [username: string]: { roleTag: string } } {
        if (this.thisRoom.gameStarted === true) {
            const roleTag: { [username: string]: { roleTag: string } } = {};

            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].alliance === 'Spy') {
                    if (this.thisRoom.playersInGame[i].role !== 'Oberon') {
                        roleTag[this.thisRoom.playersInGame[i].username] = { roleTag: 'Spy' };
                    }
                }
            }
            return roleTag;
        } else {
            return {};
        }
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
}