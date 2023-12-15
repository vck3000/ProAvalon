import { Matchmaking } from '../matchmaking';

describe('Matchmaking', () => {
    let matchmaking: Matchmaking;

    beforeEach(() => {
        matchmaking = new Matchmaking();
    });

    it('should allow a user to be added to the queue', () => {
        matchmaking.addUserToQueue('pronub');

        expect(matchmaking.userQueue).toContain('pronub');
    });

    it('should remove a user from the queue', () => {
        matchmaking.addUserToQueue('pronub');

        expect(matchmaking.userQueue).toContain('pronub');

        matchmaking.removeUser('pronub');

        expect(matchmaking.userQueue).not.toContain('pronub');
    });

    it('should do nothing if the user is not in the queue', () => {
        expect(matchmaking.userQueue).not.toContain('pronub');

        matchmaking.removeUser('pronub');

        expect(matchmaking.userQueue).toEqual([]);
    });

    it('should return a list of users if the desired room size is met from users in queue', () => {
        matchmaking.addUserToQueue('pronub0');
        matchmaking.addUserToQueue('pronub1');
        matchmaking.addUserToQueue('pronub2');

        expect(matchmaking.userQueue).toEqual(['pronub0', 'pronub1', 'pronub2']);
        expect(matchmaking.checkRoomPossible(1)).toEqual(['pronub0']);
        expect(matchmaking.userQueue).toEqual(['pronub1', 'pronub2']);
        expect(matchmaking.checkRoomPossible(2)).toEqual(['pronub1', 'pronub2']);
    });

    it('should remove users from the queue if roomSize is met', () => {
        matchmaking.addUserToQueue('pronub0');
        matchmaking.addUserToQueue('pronub1');
        matchmaking.addUserToQueue('pronub2');

        expect(matchmaking.userQueue).toEqual(['pronub0', 'pronub1', 'pronub2']);

        matchmaking.checkRoomPossible(3);

        expect(matchmaking.userQueue).toEqual([]);
    });

    it('should return null if the desired room size is not met from users in queue', () => {
        matchmaking.addUserToQueue('pronub0');

        expect(matchmaking.userQueue).toEqual(['pronub0']);

        expect(matchmaking.checkRoomPossible(3)).toEqual(null);
    });
});