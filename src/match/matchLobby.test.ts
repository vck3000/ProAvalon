import { Lobby } from './matchLobby';
import { Player } from './matchLobby';

describe('Lobby', () => {
  let lobby: Lobby;
  
  beforeEach(() => {
    lobby = new Lobby();
  });
  
  describe('addPlayer', () => {
    it('should add a player to the queue if there are less than 5 players in the queue', () => {
      const player1: Player = { name: 'John' };
      const player2: Player = { name: 'Jane' };
      lobby.addPlayer(player1);
      lobby.addPlayer(player2);
      expect(lobby.getPlayers()).toEqual([player1, player2]);
    });
  
    it('should not add a player to the queue if there are already 5 players in the queue', () => {
      const player1: Player = { name: 'John' };
      const player2: Player = { name: 'Jane' };
      const player3: Player = { name: 'Jack' };
      const player4: Player = { name: 'Jill' };
      const player5: Player = { name: 'Jess' };
      const player6: Player = { name: 'Jim' };
      lobby.addPlayer(player1);
      lobby.addPlayer(player2);
      lobby.addPlayer(player3);
      lobby.addPlayer(player4);
      lobby.addPlayer(player5);
      lobby.addPlayer(player6);
      expect(lobby.getPlayers()).toEqual([player1, player2, player3, player4, player5]);
    });
  });
  
  describe('clearPlayers', () => {
    it('should clear the player queue', () => {
      const player1: Player = { name: 'John' };
      const player2: Player = { name: 'Jane' };
      lobby.addPlayer(player1);
      lobby.addPlayer(player2);
      lobby.clearPlayers();
      expect(lobby.getPlayers()).toEqual([]);
    });
  });
});
  