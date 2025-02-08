export interface ISeason {
  id: string;
  index: number;
  name: string;
  startDate: Date;
  endDate: Date;

  ratingBrackets: {
    name: string;
    min: number;
    max: number;
  }[];
}
