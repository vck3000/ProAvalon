export class SeeMorganaInfoComponent {
    private Morgana: string;
    private Role: string;
    private isEnabled: boolean;

    constructor(Morgana: string, Role: string, isEnabled: boolean) {
        this.Morgana = Morgana;
        this.Role = Role;
        this.isEnabled = isEnabled;
    }

    // Getter and setter for Morgana
    getMorgana(): string {
        return this.Morgana;
    }

    setMorgana(Morgana: string): void {
        this.Morgana = Morgana;
    }

    // Getter and setter for Role
    getRole(): string {
        return this.Role;
    }

    setRole(Role: string): void {
        this.Role = Role;
    }

    // Getter and setter for isEnabled
    getIsEnabled(): boolean {
        return this.isEnabled;
    }

    setIsEnabled(isEnabled: boolean): void {
        this.isEnabled = isEnabled;
    }
}
