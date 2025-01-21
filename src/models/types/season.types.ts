export interface ISeason {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  // Mongoose methods
  save: () => Promise<void>;
}
