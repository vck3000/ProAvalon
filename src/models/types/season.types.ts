import { Document } from 'mongoose';

export interface ISeason extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}
