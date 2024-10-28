import  { GameConfig, isSubsetOf }  from '../game';
import Game from '../game';
import { RoomConfig } from '../room';
import { GameMode } from '../gameModes';
import { ReadyPrompt } from '../../sockets/readyPrompt';
import { RoomCreationType } from '../roomTypes';


jest.mock('../gameWrapper');


const vh = {
  'Piplup':
    [
      [
        'VHpicked VHreject',
        'VHapprove',
      ],
      [
        'VHapprove',
      ],
      [
        'VHleader VHapprove',
      ],
    ],
  'Torchic':
    [
      [
        'VHpicked VHleader VHreject',
        'VHapprove',
      ],
      [
        'VHapprove',
      ],
      [
        'VHapprove',
      ],
    ],
  'Mudkip':
    [
      [
        'VHreject',
        'VHpicked VHapprove',
      ],
      [
        'VHpicked VHapprove',
      ],
      [
        'VHpicked VHapprove',
      ],
    ],
  'Turtwig':
    [
      [
        'VHreject',
        'VHleader VHapprove',
      ],
      [
        'VHapprove',
      ],
      [
        'VHpicked VHapprove',
      ],
    ],
  'MewTwo':
    [
      [
        'VHreject',
        'VHapprove',
      ],
      [
        'VHpicked VHleader VHapprove',
      ],
      [
        'VHpicked VHapprove',
      ],
    ],
  'Charmander':
    [
      [
        'VHreject',
        'VHpicked VHapprove',
      ],
      [
        'VHpicked VHapprove',
      ],
      [
        'VHpicked VHapprove',
      ],
    ],
};

const roomConfig: RoomConfig = new RoomConfig(
  '1',
  1,
  jest.fn(),
  10,
  '', //password
  GameMode.AVALON,
  false,
  new ReadyPrompt(),
);
const gameConfig: GameConfig = new GameConfig(
  roomConfig,
  false,
  false,
  false,
  RoomCreationType.CUSTOM_ROOM,
  jest.fn(),
);

const mockGame: Game = new Game(gameConfig);


const adjustGame = (game: Game) => {
 
      game.voteHistory = vh; 
      game.enableSinadMode = true;
      game.playersInGame = ['Piplup', 'Torchic', 'Mudkip', 'Turtwig', 'MewTwo', 'Charmander'];
      game.gameMode = GameMode.AVALON;
      game.missionHistory = ['succeeded','succeeded','failed'];
};


describe('Sinad mode', () => {
  beforeEach( () => {
    adjustGame(mockGame);
  });


  it('should only work for 6p', () => {
      expect(mockGame.shouldSinadRun()).toEqual(true);
      mockGame.playersInGame.push('Squirtle');
      expect(mockGame.shouldSinadRun()).toEqual(false);
  });

  it('should not run if m1 failed', () => {
    expect(mockGame.shouldSinadRun()).toEqual(true);
    mockGame.missionHistory[0] = 'failed';
    expect(mockGame.shouldSinadRun()).toEqual(false);
});

  it('should not run if sinad is disabled', () => {
  expect(mockGame.shouldSinadRun()).toEqual(true);
  mockGame.enableSinadMode = false;
  expect(mockGame.shouldSinadRun()).toEqual(false);
});

  it('should correctly get players on mission', () => {
    const m2Players = mockGame.getPlayersOnMission(2);
    expect(m2Players.has("Piplup")).toEqual(false);
    expect(m2Players.has("Torchic")).toEqual(false);
    expect(m2Players.has("Mudkip")).toEqual(true);
    expect(m2Players.has("MewTwo")).toEqual(true);
    expect(m2Players.has("Charmander")).toEqual(true);
  });

  it('should return emptyset if mission has not occured', () => {
    const m4Players = mockGame.getPlayersOnMission(4);
    expect(m4Players).toEqual(new Set<string>());
  });

  it('should correctly identify subsets', () => {
    const m2Players = mockGame.getPlayersOnMission(2);
    const m3Players = mockGame.getPlayersOnMission(3);
    const m4Players = mockGame.getPlayersOnMission(4);

    expect(isSubsetOf(m2Players, m3Players)).toEqual(true);
    expect(isSubsetOf(m2Players, m3Players)).toEqual(true);
    
    //m4 is emptyset, so should reutrn true.
    expect(isSubsetOf(m4Players, m2Players)).toEqual(true);
    
    m2Players.delete("Mudkip");
    m2Players.add("asdf");

    expect(isSubsetOf(m2Players, m3Players)).toEqual(false);
  });
  it('should pass these Sets declared the old fashioned way', () => {
    const setA = new Set<string>(['a', 'b', 'c']);
    const setB = new Set<string>(['a', 'd', 'c','b']);
    expect(isSubsetOf(setA,setB)).toEqual(true);
    const setC = new Set<string>(['a','e','d','c']);
    expect(isSubsetOf(setA,setC)).toEqual(false);
    expect(isSubsetOf(undefined,setC)).toEqual(false);
    expect(isSubsetOf(setA,undefined)).toEqual(false);
    expect(isSubsetOf(new Set<String>(),undefined)).toEqual(false);
    expect(isSubsetOf(undefined,new Set<String>())).toEqual(false);
    expect(isSubsetOf(undefined, undefined)).toEqual(false);

  });
});
