enum Phase {
  // Core phases
  pickingTeam = 'pickingTeam',
  votingTeam = 'votingTeam',
  votingMission = 'votingMission',
  finished = 'finished',

  // Extra roles/cards
  assassination = 'assassination',
  lady = 'lady',
  ref = 'ref',
  sire = 'sire',

  // Misc
  paused = 'paused',
  frozen = 'frozen',
}

export default Phase;
