import Game from "../../Game";

export class AssassinateComponent {
    protected assassin: string;
    protected isEnabled: boolean;
    protected role: string = 'Assassin';
    protected alliance: string = 'Spy';
    protected specialPhase: string = 'assassination';
    protected description: string =  'If the resistance win 3 missions, the Assassin can shoot one person for Merlin, or two people for Tristan and Isolde. If they are correct, the spies win!';
    protected orderPriorityInOptions: number = 90;
    protected playerShot: string = '';
    protected playerShot2: string = '';
    protected thisRoom: Game;
    constructor(assassin: string, isEnabled: boolean, thisroom: Game) {
        this.assassin = assassin;
        this.isEnabled = isEnabled;
        this.thisRoom = thisroom;
    }

    getMorgana(): string {
        return this.assassin;
    }

    setViewer(newAssassin: string): void {
        this.assassin = newAssassin;
    }

    getEnabled(): boolean {
        return this.isEnabled;
    }

    setEnabled(newEnabled: boolean): void {
        this.isEnabled = newEnabled;
    }

    //todo: Change this to be much more descriptive
    seeSpies(): string[]{
        // Assassin sees all spies except oberon
        if (this.thisRoom.gameStarted === true) {
            let spies:string[] = [];
            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].alliance === 'Spy') {
                    if (this.thisRoom.playersInGame[i].role === 'Oberon') {
                    // don't add oberon
                        } else {
                            // add the spy
                            spies.push(this.thisRoom.playersInGame[i].username);
                        }
                    }
                }
                return spies;
            }
        }

    //TO DO: can this possibly become a phase component?
    checkSpecialMove(): boolean{
        // Check for assassination mode and enter it if it is the right time
        if (this.playerShot === '') {
        // If we have the right conditions, we go into assassination phase
            if (this.thisRoom.phase === 'finished') {
                // Get the number of successes:
                let numOfSuccesses = 0;

                for (var i = 0; i < this.thisRoom.missionHistory.length; i++) {
                    if (this.thisRoom.missionHistory[i] === 'succeeded') {
                        numOfSuccesses++;
                    }
                }
                // Check if Merlin exists.
                let merlinExists = false;
                // Check if iso tristan are both in the game.
                let tristExists = false;
                let isoExists = false;
                for (var i = 0; i < this.thisRoom.playersInGame.length; i++) {
                    if (this.thisRoom.playersInGame[i].role === 'Merlin') {
                        merlinExists = true;
                    }
                    if (this.thisRoom.playersInGame[i].role === 'Tristan') {
                        tristExists = true;
                    }
                    if (this.thisRoom.playersInGame[i].role === 'Isolde') {
                        isoExists = true;
                    }
                }
                if (numOfSuccesses === 3 && (merlinExists === true || (tristExists === true && isoExists === true))) {
                    // Set the assassination phase
                    this.thisRoom.startAssassinationTime = new Date();
                    this.thisRoom.phase = this.specialPhase;
                    return true;
                }
            }
        }
    return false;
    }

    getPublicGameData() {
        if (this.playerShot !== '') {
            return { assassinShotUsername: this.playerShot,assassinShotUsername2: this.playerShot2,};
        }
        return null;
    }
}