export interface ISeason {
  id: string;
  seasonCounter: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  // Mongoose methods
  save: () => Promise<void>;
}
