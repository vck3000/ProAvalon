import { MatchMakingQueueItem } from "./MatchMakingQueueItem";

export const avg = (values: number[]) => {
  return values.reduce((sum, current) => sum + current, 0) / values.length;
};

export const variance = (values: number[], waitingTime: number[]) => {
  const waitingPeriod = 60000; // 60 seconds for now, can change latter ( wait up to 1 mins)
  const average = avg(values);
  const squareDiffs = values.map((value, index) => {
    let diff = value - average;
    const timeDiff = waitingTime[index];

    // decrease the variance
    if (timeDiff > waitingPeriod) {
      diff = Math.abs(diff) * (waitingPeriod / timeDiff);
    }
    return diff * diff;
  });
  const variance = avg(squareDiffs);
  return variance;
};

export function matchMakePlayers(queue: MatchMakingQueueItem[]) {
//   const queue = rankedQueue.get();
  if (queue.length < 6) {
    return [];
  }

  const sortedRating = queue.map(({ playerRating }) => playerRating);
  const waitingTime = queue.map(({ timeJoinedAt }) => Date.now() - timeJoinedAt);
  const window = 6; // 6 players for now

  let validVariance = 1000; // players rating points variance

  let min = +Infinity;
  let playerIndex = -1;

  for (let index = 0; index < sortedRating.length - window + 1; index++) {
    const v = variance(
      sortedRating.slice(index, index + window),
      waitingTime.slice(index, index + window),
    );
    if (v < min) {
      min = v;
      playerIndex = index;
    }
  }
  console.log({matchMakePlayers,min,waitingTime})
  if (min < validVariance) {
    // match found
    const matched = queue.slice(playerIndex, playerIndex + window);

    // Socket API will handle this
    // matched.forEach((player) => {
    //   rankedQueue.leave(player.id);
    // });
    printQueue(matched);
    return matched;
  }
}

// export const debouncedMatch = debounce(matchMakePlayers, 3000);

function printQueue(queue: MatchMakingQueueItem[]) {
  console.log(queue.map(({ username, playerRating }) => ({ username, playerRating })));
}
// this part is done by socket API

// when someone join the queue
// rankedQueue.subscribe({
//   onJoin: (playerId) => {
//     console.log(`${playerId} joined`);
//     printQueue(rankedQueue.get());
//     debouncedMatch();
//   },
//   onLeave: (playerId) => {
//     console.log(playerId + ' left');
//     debouncedMatch();
//   },
//   subscriberId: 'match_making',
// });

