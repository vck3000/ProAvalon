//import { isSubsetOf } from '../game';
//import Game from '../game';

const getPlayersOnMission = (VH: any, missionNum: number): Set<string> => {    
    
  //VH = this.voteHistory; //for brevity
  
  const set = new Set<string>();

  if(VH === undefined) {
    return set; //return empty set.
  }

  for (const player in VH) {
    //TODO: write check to ensure player really is in this.PlayersInGame.
    if (VH.hasOwnProperty(player)) {
      if(VH[player].length < missionNum) { //in case mission hasn't happened yet.
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

describe('Sinad mode', () => {
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
  
  


  it('should correctly get players on mission', () => {
    const m2Players = getPlayersOnMission(vh, 2);
    expect(m2Players.has("Piplup")).toEqual(false);
    expect(m2Players.has("Torchic")).toEqual(false);
    expect(m2Players.has("Mudkip")).toEqual(true);
    expect(m2Players.has("MewTwo")).toEqual(true);
    expect(m2Players.has("Charmander")).toEqual(true);

    //m4 hasn't happened so it should return empty set.
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
  }
  );
});
