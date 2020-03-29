function* dateGenerator(): Generator {
  let d = 1583135940000;
  while (true) {
    d += 1;
    yield d;
  }
}

const dateGenObj = dateGenerator();
export default dateGenObj;
