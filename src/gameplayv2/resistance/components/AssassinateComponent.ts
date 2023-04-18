export class AssassinateComponent {
    private assassin: string;
    private role: string;
    private isEnabled: boolean;

    constructor(assassin: string, role: string, isEnabled: boolean) {
        this.assassin = assassin;
        this.role = role;
        this.isEnabled = isEnabled;
    }

    getMorgana(): string {
        return this.assassin;
    }

    setViewer(newAssassin: string): void {
        this.assassin = newAssassin;
    }

    //getters and setters for role that is being viewed by Morgana
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

    verifyAssassinate(){
        //TO DO
    }
}