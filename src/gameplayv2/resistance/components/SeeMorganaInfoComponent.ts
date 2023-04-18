export class SeeMorganaInfoComponent {
    private morgana: string;
    private role: string;
    private isEnabled: boolean;

    constructor(morgana: string, role: string, isEnabled: boolean) {
        this.morgana = morgana;
        this.role = role;
        this.isEnabled = isEnabled;
    }

    getMorgana(): string {
        return this.morgana;
    }

    setViewer(newMorgana: string): void {
        this.morgana = newMorgana;
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

    verifySee(){
        //TO DO
    }
}