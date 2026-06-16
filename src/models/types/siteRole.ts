export enum PowerRole {
  Moderator = 'MODERATOR',
  TournamentOrganizer = 'TOURNAMENT_ORGANIZER',
  Percival = 'PERCIVAL'
}

export interface ISiteRole {
  id: string;
  role: PowerRole;
  usernameLower: string;
}