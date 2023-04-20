import { Router } from 'express';
import { Lobby } from '../match/matchLobby';
import User from '../models/user';

const router = Router();
const Match_Lobby = new Lobby();

// create lobby API
router.post('/joinLobby', async (req, res) => {
  const { username }: { username: string } = req.body;
  if (!username) {
    return res.status(400).send({ message: 'bad request' });
  }
  const usernameLower = username.toLowerCase();
  const isPlayerExist = await User.find({
    usernameLower,
  });

  if (isPlayerExist.length == 0) {
    return res.status(404).send({ message: 'can not find this player' });
  }
  // check if user is already in the lobby
  const inTheQueue = Match_Lobby.getPlayers().find((item) => item.name === username);
  if (inTheQueue) {
    return res.status(400).send({ message: 'you are already in the lobby' });
  }
  Match_Lobby.addPlayer({ name: username });
  return res.status(200).send({ message: 'join lobby successfully' });
});

// cancel lobby if someone does not select join
router.post('/cancel-lobby', async (req, res) => {
  const MAX_WAIT_TIME = 30000;
  let waitingTimer;

  const cancel_lobby_query = () => {
    Match_Lobby.clearPlayers();
    res.send('Lobby canceled');
  };

  waitingTimer = setTimeout(cancel_lobby_query, MAX_WAIT_TIME);

  if (waitingTimer) {
    clearTimeout(waitingTimer);
    waitingTimer = null;
    Match_Lobby.clearPlayers();
    res.send('Lobby canceled');
  } else {
    res.send('ok here');
  }
});

export default router;
