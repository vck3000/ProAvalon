import PatreonId from '../models/patreonId';

export default async function getPatreonDetails(patreonId: string) {
  return await PatreonId.find({ id: patreonId });
}
