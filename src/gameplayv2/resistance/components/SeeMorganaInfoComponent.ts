export class SeeMorganaInfoComponent {
    private Morgana: string;
    private Role: string;
    private isEnabled: boolean;
    private thisRoom: any;

    constructor(Morgana: string, Role: string, isEnabled: boolean, thisRoom: any) {
        this.Morgana = Morgana;
        this.Role = Role;
        this.isEnabled = isEnabled;
        this.thisRoom = thisRoom;
    }

    see(): { [username: string]: { roleTag: string } } {
        if (this.thisRoom.gameStarted === true) {
            const roleTag: { [username: string]: { roleTag: string } } = {};

            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].role === 'Morgana') {
                    if (this.thisRoom.playersInGame[i].role !== 'Oberon') {
                        roleTag[this.thisRoom.playersInGame[i].username] = { roleTag: 'Morgana' };
                    }
                }
            }
            return roleTag;
        } else {
            return {};
        }
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
