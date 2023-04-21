export interface Player {
    name: string;
}

export class Lobby {
    private UnrankplayersQueue: Player[];

    constructor() {
      this.UnrankplayersQueue = [];
    } 

    public displayPlayers(): void {
      this.UnrankplayersQueue.forEach(player => {
        console.log(`Name: ${player.name}`);
      });
    }

    public addPlayer(player: Player): void {
      if (this.UnrankplayersQueue.length < 5) {
        this.UnrankplayersQueue.push(player);
      }
    }

    public getPlayers(): Player[] {
      return this.UnrankplayersQueue;
    }

    public clearPlayers(): void {
      this.UnrankplayersQueue = [];
    }
}