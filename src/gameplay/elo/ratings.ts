import { Alliance } from '../gameEngine/types';
import Game from '../gameEngine/game';

export const DEFAULT_RATING = 1500;
const PROVISIONAL_GAMES_REQUIRED = 20;

/*
ELO RATING CALCULATION:

Usual formula: R_new = R_old + k(Actual - Expected)

1. Use average team rating and pit together in a 1v1 format.
2. Adjust ratings for Res and Spy winrates (constant adjustment based on site winrates, maybe for that player size).
2. Using k-value k=38, calculate adjustment amount = k(Actual - Expected)
    a. Actual = 1 for win, 0 for loss
    b. Expected = 1/(1 + 10^-(R_old - R_opp)/400)
3. Multiplicative adjustment based on player size.
4. If provisional players are in the game, adjust the elo changes based on how close they are to being experienced.
5. Divide equally between players on each team and adjust ratings. (Done in the finishGame function)
*/

export function calculateResistanceRatingChange(
  winningTeam: Alliance,
  provisionalGame: boolean,
  game: Game,
) {
  // Constant changes in elo due to unbalanced winrate, winrate changes translated to elo points.
  const playerSizeEloChanges = [62, 56, 71, 116, 18, 80];
  // k value parameter for calculation
  const k = 42;
  // Calculate ratings for each team by averaging elo of players
  const resTeamEloRatings = game.playersInGame
    .filter((soc) => soc.alliance === Alliance.Resistance)
    .map((soc) => soc.request.user.playerRating);
  const spyTeamEloRatings = game.playersInGame
    .filter((soc) => soc.alliance === Alliance.Spy)
    .map((soc) => soc.request.user.playerRating);

  let total = 0;
  for (let i = 0; i < resTeamEloRatings.length; i++) {
    total += resTeamEloRatings[i];
  }
  let resElo = total / resTeamEloRatings.length;

  total = 0;
  for (let i = 0; i < spyTeamEloRatings.length; i++) {
    total += spyTeamEloRatings[i];
  }
  let spyElo = total / spyTeamEloRatings.length;

  // Adjust ratings for sitewide winrates. Using hardcoded based on current.
  spyElo += playerSizeEloChanges[game.playersInGame.length - 5];

  console.log('Resistance Team Elo: ' + resElo);
  console.log('Spy Team Elo: ' + spyElo);

  // Calculate elo change, adjusting for player size, difference is 1- or just -
  let eloChange = 0;
  if (winningTeam === Alliance.Resistance) {
    eloChange =
      k *
      (1 - 1 / (1 + Math.pow(10, -(resElo - spyElo) / 500))) *
      (game.playersInGame.length / 5); //smoothed from 400 to 500 division
  } else if (winningTeam === Alliance.Spy) {
    eloChange =
      k *
      (-1 / (1 + Math.pow(10, -(resElo - spyElo) / 500))) *
      (game.playersInGame.length / 5); //smoothed from 400 to 500 division
  } else {
    // winning team should always be defined
    game.sendText(
      'Error in elo calculation, no winning team specified.',
      'server-text',
    );
    return;
  }

  // If the game is provisional, apply a multiplicative reduction in elo change based on how experienced the players are.
  if (provisionalGame) {
    const provisionalPlayers = game.playersInGame.filter(
      (soc) => soc.request.user.ratingBracket === 'unranked',
    );
    let totalProvisionalGames = 0;
    for (let i = 0; i < provisionalPlayers.length; i++) {
      totalProvisionalGames +=
        provisionalPlayers[i].request.user.totalRankedGamesPlayed;
    }
    eloChange =
      ((totalProvisionalGames +
        (game.playersInGame.length - provisionalPlayers.length) *
          PROVISIONAL_GAMES_REQUIRED) /
        (PROVISIONAL_GAMES_REQUIRED * game.playersInGame.length)) *
      eloChange;
  }
  return eloChange;
}

/*
PROVISIONAL ELO RATING CALCULATION:

If there is only one provisional player in the game:
Formula: R_new = (R_old*N_old + sum(otherPlayerRatings)/numOtherPlayers + 200*TeamAdjustment*Result)/(N_old+1)
    where N_old = Number of games played
          Result = 1 for win, 0 for loss

If there is more than one provisional player in the game:
Formula: R_new = (R_old*N_old + sum(allPlayerRatings)/numPlayers + 200*TeamAdjustment*Result)/(N_old+1)
    where N_old = Number of games played
          Result = 1 for win, 0 for loss

This rating style takes into account all the ratings of the players in the games that you play with to determine your starting point.
For the first few games it will result in wild rating changes, but will level out towards the end of the provisional section.
Could possibly lead to some people abusing their early rating by only playing with strong players and getting lucky, but should level out in the end.
*/
export function calculateNewProvisionalRating(
  winningTeam: Alliance,
  playerSocket: any,
  playerRatings: number[],
  game: any,
) {
  // Constant changes in elo due to unbalanced winrate, winrate changes translated to elo points.
  const playerSizeWinrates = [0.57, 0.565, 0.58, 0.63, 0.52, 0.59];
  let Result = playerSocket.alliance === winningTeam ? 1 : -1;

  // Calculate new rating
  const R_old = playerSocket.request.user.playerRating;
  const N_old = playerSocket.request.user.totalRankedGamesPlayed;
  const ratingsSum = playerRatings.reduce((sum, a) => sum + a, 0);

  // Prototype team adjustment is hardcoded, players are rewarded more for winning and penalised less for losing as res.
  // Also all changes are scaled with relation to team size to prevent deflation in provisional games.
  let teamAdj = 0;
  const resReduction =
    game.spyUsernames.length / game.resistanceUsernames.length;
  const sizeWinrate = playerSizeWinrates[game.playersInGame.length - 5];
  if (playerSocket.alliance === Alliance.Resistance) {
    if (winningTeam === playerSocket.alliance) {
      teamAdj = (sizeWinrate / (1 - sizeWinrate)) * resReduction;
    } else {
      teamAdj = resReduction;
    }
  } else {
    if (winningTeam === playerSocket.alliance) {
      teamAdj = 1;
    } else {
      teamAdj = sizeWinrate / (1 - sizeWinrate);
    }
  }

  let newRating =
    (R_old * N_old +
      ratingsSum / playerRatings.length +
      200 * teamAdj * Result) /
    (N_old + 1);

  // Prevent losing rating on win and gaining rating on loss in fringe scenarios with weird players.
  if (
    (winningTeam === playerSocket.alliance && newRating < R_old) ||
    (!(winningTeam === playerSocket.alliance) && newRating > R_old)
  ) {
    newRating = R_old;
  }
  if (winningTeam === playerSocket.alliance && newRating > R_old + 100) {
    newRating = R_old + 100;
  }
  if (!(winningTeam === playerSocket.alliance) && newRating < R_old - 100) {
    newRating = R_old - 100;
  }
  return newRating;
}
