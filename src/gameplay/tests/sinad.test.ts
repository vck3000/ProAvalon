// import  isSubsetOf  from '../game';
// import Game from '../game';
import { GameMode } from '../gameModes';

const getPlayersOnMission = (VH: any, missionNum: number): Set<string> => {      
  const set = new Set<string>();

  if(VH === undefined) {
    return set; //return empty set.
  }

  for (const player in VH) {
    //TODO: write check to ensure player really is in this.PlayersInGame.
    if (VH.hasOwnProperty(player)) {
      if(VH[player].length < missionNum) {
        //in case mission hasn't happened yet.
        return set;
      }
    
      const missionNumVH = VH[player][missionNum - 1];
      const lastPick = missionNumVH[missionNumVH.length - 1];

      if (lastPick.includes('VHpicked')) {
        set.add(player);
      }
    }
  }
  return set;
};


const isSubsetOf = (setA:Set<string>, setB:Set<string>): boolean => {
  if(setA === undefined || setB === undefined) {
    return false;
  }

  for(const x of setA) {
    if(setB.has(x)) {
      continue;
    }
    else return false;
  }
  return true;
}

const shouldSinadRun =(game: any): boolean => {
  return (
     game.enableSinadMode
  // this 6p check is also covered by room.ts hostTryStartGame()
  && game.playersInGame.length == 6
  && game.gameMode == GameMode.AVALON

  // m1 m2 pass, m3 failed
  && game.missionHistory.length >= 3
  && game.missionHistory[0] === 'succeeded'
  && game.missionHistory[1] === 'succeeded'
  && game.missionHistory[2] === 'failed'
  );
};


//let vh: { [key: string]: string[][] };
let vh: any;
let mockGame: any;

describe('Sinad mode', () => {
  beforeEach( () => {
    vh = {
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
    
    mockGame = {
      voteHistory: vh,
      enableSinadMode: true,
      playersInGame: ['Piplup', 'Torchic', 'Mudkip', 'Turtwig', 'MewTwo', 'Charmander'],
      gameMode: GameMode.AVALON,
      missionHistory: ['succeeded','succeeded','failed']
    };
  });


  it('should only work for 6p', () => {
      expect(shouldSinadRun(mockGame)).toEqual(true);
      mockGame.playersInGame.push('Squirtle');
      expect(shouldSinadRun(mockGame)).toEqual(false);
  });

  it('should not run if m1 failed', () => {
    expect(shouldSinadRun(mockGame)).toEqual(true);
    mockGame.missionHistory[0] = 'failed';
    expect(shouldSinadRun(mockGame)).toEqual(false);
});

  it('should not run if sinad is disabled', () => {
  expect(shouldSinadRun(mockGame)).toEqual(true);
  mockGame.enableSinadMode = false;
  expect(shouldSinadRun(mockGame)).toEqual(false);
});

  it('should correctly get players on mission', () => {
    const m2Players = getPlayersOnMission(vh, 2);
    expect(m2Players.has("Piplup")).toEqual(false);
    expect(m2Players.has("Torchic")).toEqual(false);
    expect(m2Players.has("Mudkip")).toEqual(true);
    expect(m2Players.has("MewTwo")).toEqual(true);
    expect(m2Players.has("Charmander")).toEqual(true);
  });

  it('should return emptyset if mission has not occured', () => {
    const m4Players = getPlayersOnMission(vh,4);
    expect(m4Players).toEqual(new Set<string>());
  });

  it('should correctly identify subsets', () => {
    const m2Players = getPlayersOnMission(vh, 2);
    const m3Players = getPlayersOnMission(vh, 3);
    const m4Players = getPlayersOnMission(vh, 4);

    expect(isSubsetOf(m2Players, m3Players)).toEqual(true);
    expect(isSubsetOf(m2Players, m3Players)).toEqual(true);
    
    //m4 is empty so mathematically it's a subset, this function should reutrn true.
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


  });
});
