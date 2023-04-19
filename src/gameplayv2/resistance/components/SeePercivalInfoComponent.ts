export class SeePercivalInfoComponent {
    private percival: string;
    private role: string;
    private isEnabled: boolean;

    constructor(percival: string, role: string, isEnabled: boolean) {
        this.percival = percival;
        this.role = role;
        this.isEnabled = isEnabled;
    }

    getPercival(): string {
        return this.percival;
    }

    setViewer(newPercival: string): void {
        this.percival = newPercival;
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