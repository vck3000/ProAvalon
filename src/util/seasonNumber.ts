let seasonNumber = 1;

export default {
  getSeasonNumber(): number {
    return seasonNumber;
  },

  setSeasonNumber(newSeasonNumber: number): void {
    seasonNumber = newSeasonNumber;
  },
};
