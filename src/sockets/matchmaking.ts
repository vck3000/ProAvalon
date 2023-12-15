export class Matchmaking {
    userQueue: string[];

    constructor() {
        this.userQueue = [];
    }

    // Add user to queue
    addUserToQueue(username: string): void {
        if (!(username in this.userQueue)) {
            this.userQueue.push(username);
        }
    }

    // Remove user from queue
    removeUser(username: string): void {
        const index = this.userQueue.indexOf(username);
        if (index !== -1) {
            this.userQueue.splice(index, 1);
        }
    }

    // Checks if number users in queue >= specified roomSize.
    // If yes, returns the list of users and removes them from the queue.
    // If < specified roomSize, returns null
    checkRoomPossible(roomSize: number): string[] | null {
        if (this.userQueue.length >= roomSize) {
            const users = this.userQueue.slice(0 , roomSize);
            this.userQueue = this.userQueue.slice(roomSize);
            return users;
        } else return null;
    }
}