import seasonNumber from '../../models/seasonNumber.js';

async function getSeasonNumber() {
    try {
        // seasonNumber.findOne({}).exec().then((returnedSeasonNumber) => {
        //     if (!returnedSeasonNumber) {
        //         seasonNumber.create({ number: 1 });
        //     }
        // });
        const returnedSeasonNumber = await seasonNumber.findOne({}).exec();
        return returnedSeasonNumber.number;
    } catch (err) {
        console.error(err);
    }
}

export default getSeasonNumber;