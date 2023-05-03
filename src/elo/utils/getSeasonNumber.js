import seasonNumber from '../../models/seasonNumber.js';

async function getSeasonNumber() {
    try {
        let returnedSeasonNumber = await seasonNumber.findOneAndUpdate(
            {},
            { $setOnInsert: { number: 1 } },
            { upsert: true, new: true }
          );
          return returnedSeasonNumber.number;
        } catch (error) {
          console.error('Something went wrong:', error);
        }
}

export default getSeasonNumber;