/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
export const murmurhash = (str: string, seed: number): number => {
  let l = str.length;
  let h = seed ^ l;
  let i = 0;
  let k;

  while (l >= 4) {
    k =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24);

    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
    k ^= k >>> 24;
    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);

    h =
      ((h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
      k;

    l -= 4;
    ++i;
  }

  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
      break;
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
      break;
    default:
      h ^= str.charCodeAt(i) & 0xff;
      h =
        (h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  }

  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  h ^= h >>> 15;

  return h >>> 0;
};
