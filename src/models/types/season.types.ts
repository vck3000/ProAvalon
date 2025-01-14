import { Document } from 'mongoose';

export interface ISeason extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}
