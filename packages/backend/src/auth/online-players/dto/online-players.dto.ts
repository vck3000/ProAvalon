import { IsDefined, IsString } from 'class-validator';

// empty
export enum OnlinePlayerRewards {}

export class OnlinePlayer {
  @IsString()
  @IsDefined()
  username!: string;

  @IsDefined()
  rewards!: OnlinePlayerRewards[];
}
