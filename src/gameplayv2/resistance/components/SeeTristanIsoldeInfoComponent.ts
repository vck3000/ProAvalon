export class SeeTristanIsoldeInfoComponent {
    //here, player is defined as the player that is able to view entities specified in playersVisible array.
    private player: string;
    private isEnabled: boolean;
    private thisRoom: any;
    private playersVisible: string[];

    constructor(playersVisible: string[], player: string, isEnabled: boolean, thisRoom: any) {
        this.playersVisible = playersVisible;
        this.player = player;
        this.isEnabled = isEnabled;
        this.thisRoom = thisRoom;
    }

    //TO DO: Need to get this running where it will return the array of strings in form of role tage
    //See method is verified by using this implementatiomn
    // see(): {[username: string]: {roleTag: string}} {
    //     const roleTag: {[username: string]: {roleTag: string}} = {};
    //     for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
    //       if (this.thisRoom.playersInGame[i].role === 'Isolde') {
    //         roleTag[this.thisRoom.playersInGame[i]].username = {};
    //         roleTag[this.thisRoom.playersInGame[i]].username.roleTag = 'Isolde';
    //       }
    //     }
    //     return roleTag;
    // }
      
    getPlayersvisible(): string[] {
        return this.playersVisible;
    }

    setViewer(newPlayer: string[]): void {
        this.playersVisible = newPlayer;
    }

    //getters and setters for role that is being viewed by Morgana
    getPlayer(): string {
        return this.player;
    }

    setPlayer(player: string): void {
        this.player = player;
    }

    getEnabled(): boolean {
        return this.isEnabled;
    }

    setEnabled(newEnabled: boolean): void {
        this.isEnabled = newEnabled;
    }
}