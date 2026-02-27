const getPlayersOnMission = (vh: any, missionNum: number) => {
  const set = new Set<string>();

  Object.keys(vh).forEach(function(playerName, index) {
    const lastPick = vh[playerName][missionNum - 1];
    if (lastPick[lastPick.length - 1].split(" ").includes('VHpicked')) {
      set.add(playerName);
    }
  });

  return set;
};

const isMissionASubsetOfMissionB = (missionA: Set<string>, missionB: Set<string>) => {
  const diff = missionB.difference(missionA);
  return diff.size == missionB.size - missionA.size;
};

describe('ASDF', () => {
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

  it('test', () => {
    const m2Players = getPlayersOnMission(vh, 2);
    expect(m2Players.has("Piplup")).toEqual(false);
    expect(m2Players.has("Torchic")).toEqual(false);
    expect(m2Players.has("Mudkip")).toEqual(true);
    expect(m2Players.has("MewTwo")).toEqual(true);
    expect(m2Players.has("Charmander")).toEqual(true);
  });

  it('test2', () => {
    const m2Players = getPlayersOnMission(vh, 2);
    const m3Players = getPlayersOnMission(vh, 3);

    expect(isMissionASubsetOfMissionB(m2Players, m3Players)).toEqual(true);

    m2Players.delete("Mudkip");
    m2Players.add("asdf");

    expect(isMissionASubsetOfMissionB(m2Players, m3Players)).toEqual(false);
  });
});