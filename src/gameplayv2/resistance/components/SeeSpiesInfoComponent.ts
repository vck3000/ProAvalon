export class SeeSpiesInfoComponent {
    private player: string;
    private allSpies: string[];
    private isEnabled: boolean;

    constructor(player: string, allSpies: string[], isEnabled: boolean) {
        this.player = player;
        this.allSpies = allSpies;
        this.isEnabled = isEnabled;
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