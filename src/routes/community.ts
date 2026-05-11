import { Router } from 'express';
import User from '../models/user';
import { ModStore } from '../modsadmins/roles';

const router = Router();


// Community route
router.get('/community', async (req, res) => {
  const getall = req.query.getall !== undefined;

  const modsArray = ModStore.getRoleArray();
  const filteredModsArray = modsArray.filter((mod) => mod != 'pronub');

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
