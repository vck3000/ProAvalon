import { Router } from 'express';
import { Queue } from '../match/queue';
import User from '../models/user';
const router = Router();

const rankedQueue = new Queue();
// join ranked queue API
router.post('/match/join', async (req, res) => {
  const { username }: { username: string } = req.body;
  if (!username) {
    return res.status(400).send({ message: 'cad request' });
  }
  const usernameLower = username.toLowerCase();
  const isPlayerExist = await User.find({
    usernameLower,
  });

  if (isPlayerExist.length == 0) {
    return res.status(404).send({ message: 'can not find this player' });
  }
  // check if user is already in the queue
  const inTheQueue = rankedQueue.get().find((item) => item.id === username);
  if (inTheQueue) {
    return res.status(400).send({ message: 'you are already in the queue' });
  }
  rankedQueue.join(username);
  return res.status(200).send({ message: 'join queue successfully' });
});

// leave ranked queue API
router.post('/match/leave', async (req, res) => {
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
  rankedQueue.leave(username);
  return res.status(200).send({ message: 'leave the queue successfully' });
});

// get queue or get first n's players
router.get('/match/queue', (req, res) => {
  const { quantity } = req.body;
  const result = isNaN(quantity)
    ? rankedQueue.get()
    : rankedQueue.getFirstNItems(quantity);
  return res.status(200).send({ result });
});

export default router;
