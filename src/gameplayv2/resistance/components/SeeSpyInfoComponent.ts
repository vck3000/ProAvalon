export class SeeSpyInfoComponent {
    private Spy: string;
    private Role: string;
    private isEnabled: boolean;

    constructor(Spy: string, Role: string, isEnabled: boolean) {
        this.Spy = Spy;
        this.Role = Role;
        this.isEnabled = isEnabled;
    }

    // Getter and setter for Spy
    getSpy(): string {
        return this.Spy;
    }

    setSpy(Spy: string): void {
        this.Spy = Spy;
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
