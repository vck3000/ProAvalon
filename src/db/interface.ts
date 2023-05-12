import User from '../models/user';

export interface DatabaseInterface {
  GetUserByUsername: (username: string) => Promise<typeof IUser>;
  UpdateUserElo(username: string, elo: number) =>
  // GetUserById: (id: number) => Promise<typeof User>;
}
