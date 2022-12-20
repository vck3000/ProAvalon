import PatreonId from '../models/patreonId';

export default async function getPatreonDetails(patreonId: string) {
  let patreonDetails: any;

  await PatreonId.find({ id: patreonId })
    .exec()
    .then((obj: any) => {
      patreonDetails = obj;
      // console.log('Gotten patreon details.');
    })
    .catch((err: any) => {
      console.log(err);
    });

  return patreonDetails;
}
