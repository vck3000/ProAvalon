export enum PowerRole {
  Moderator = 'moderator',
  TournamentOrganizer = 'tournamentOrganizer',
  Percival = 'percival'
}

export interface ISiteRole {
  id: string;
  role: PowerRole;
  usernameLower: string;
}