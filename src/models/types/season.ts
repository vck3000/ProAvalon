import { Types } from 'mongoose';

export interface ISeason {
  id: Types.ObjectId;
  index: number;
  name: string;
  startDate: Date;
  endDate: Date;

  ratingBrackets: {
    name: string;
    min: number;
    max: number;
  }[];

  gameMode: string;
  rolesAvailable: {
    name: string;
    alliance: string;
  }[];

  stringifySeason(): string;
}
