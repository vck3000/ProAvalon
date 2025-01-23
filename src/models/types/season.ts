import { Types } from 'mongoose';

export interface ISeason {
  id: Types.ObjectId;
  seasonCounter: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  ratingBrackets: {
    name: string;
    min: number;
    max: number;
  }[];

  // Mongoose methods
  save: () => Promise<void>;
}
