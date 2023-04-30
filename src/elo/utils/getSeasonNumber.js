import seasonNumber from '../../models/seasonNumber.js';

async function getSeasonNumber() {
    try {
        const returnedSeasonNumber = await seasonNumber.findOne({}).exec();
        return returnedSeasonNumber.number;
    } catch (err) {
        console.error(err);
    }
}

export default getSeasonNumber;