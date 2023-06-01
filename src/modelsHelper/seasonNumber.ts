import SeasonNumber from '../models/seasonNumber';

export async function getSeasonNumber(): Promise<number> {
  const seasonNum = await SeasonNumber.findOne({});
  if (!seasonNum) {
    // create season number
    const result = await SeasonNumber.create({ number: 1 });
    return result.number;
  }

  return seasonNum.number;
}

export async function incrementSeasonNumber(): Promise<number> {
  const result = await SeasonNumber.findOneAndUpdate(
    {},
    { $inc: { number: 1 } },
    { new: true },
  );

  return result.number;
}
