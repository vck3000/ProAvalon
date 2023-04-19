export class SeeMerlinInfoComponent {
    private merlin: string;
    private role: string;
    private isEnabled: boolean;

    constructor(merlin: string, role: string, isEnabled: boolean) {
        this.merlin = merlin;
        this.role = role;
        this.isEnabled = isEnabled;
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
        //TO DO
    }
}