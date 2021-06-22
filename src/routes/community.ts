import { Router } from 'express';
import User from '../models/user';
import { modsArray } from '../modsadmins/mods';

const router = Router();

const filteredModsArray = modsArray.filter((mod) => mod != 'pronub');

// Community route
router.get('/community', async (req, res) => {
  const getall = req.query.getall !== undefined;

  const users = await User.find({
    totalGamesPlayed: { $gt: 99 },
    usernameLower: { $nin: filteredModsArray },
    hideStats: null,
  })
    .limit(getall ? 10000 : 150)
    .sort({ totalGamesPlayed: -1 });

  const mods = await User.find({ usernameLower: { $in: filteredModsArray } });

  res.render('community', {
    users,
    mods,
    // @ts-ignore
    currentUser: req.user,
    headerActive: 'community',
  });
});

export default router;
