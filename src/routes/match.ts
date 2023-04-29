import { Router } from 'express';
import { MatchMakingQueue } from '../match/queue';
import User from '../models/user';

const router = Router();

const unrankedQueue = new MatchMakingQueue();
// join ranked queue API
router.post('/join', async (req, res) => {
  const { username }: { username: string } = req.body;
  if (!username) {
    return res.status(400).send({ message: 'cad request' });
  }
  const usernameLower = username.toLowerCase();
  const isPlayerExist = await User.findOne({
    usernameLower,
  });

  if (isPlayerExist) {
    return res.status(404).send({ message: 'can not find this player' });
  }
  // check if user is already in the queue
  const inTheQueue = unrankedQueue.get().find((item) => item.id === username);
  if (inTheQueue) {
    return res.status(400).send({ message: 'you are already in the queue' });
  }
  unrankedQueue.join(username);
  return res.status(200).send({ message: 'join queue successfully' });
});

// leave ranked queue API
router.post('/leave', async (req, res) => {
  const { username }: { username: string } = req.body;
  if (!username) {
    return res.status(400).send({ message: 'bad request' });
  }
  const usernameLower = username.toLowerCase();
  const isPlayerExist = await User.find({
    usernameLower,
  });

  if (isPlayerExist.length == 0) {
    return res.status(404).send({ message: 'can not find playerID' });
  }
  unrankedQueue.leave(username);
  return res.status(200).send({ message: 'leave the queue successfully' });
});

// get queue or get first n's players
router.get('/queue', (req, res) => {
  const { quantity } = req.body;
  const result = isNaN(quantity)
    ? unrankedQueue.get()
    : unrankedQueue.getFirstNItems(quantity);
  return res.status(200).send({ result });
});



// start game for 6 players by removing first N players and returning players to front end
/* req.body = {
  numOfPlayers: 6, //5 or 7 or whatever else
} */
router.post('/checkQueueForNPlayers', (req, res) => {
  const { numOfPlayers } = req.body;
  const result = isNaN(numOfPlayers)
    ? false
    : unrankedQueue.getLength() >= numOfPlayers;
  if (result) {
    // remove firstNPlayers
    const removedPlayers = unrankedQueue.deleteFirstNPlayers(numOfPlayers);
    return res.status(200).send({ players:removedPlayers, numOfPlayers })
  } else {
    // Fail game start
    return res.status(400).send({ message: 'Not enough players' });
  }
});

// once six players have confirmed, create a lobby, adjust settings and start game
router.post('/startGame', (req, res) => {
    // check src/gameplay/game.ts
    
    // TODO start game
      // Check lobby.js
      return res.status(200).send({ message: 'Game started' });
      
});

export default router;
