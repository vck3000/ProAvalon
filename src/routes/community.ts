import { Router } from 'express';
import User from '../models/user';
import { modsArray } from '../modsadmins/mods';

const router = Router();

const filteredModsArray = modsArray.filter((mod) => mod != 'pronub');

// Community route
router.get('/community', (req, res) => {
  User.find(
    {
      totalGamesPlayed: { $gt: 99 },
      usernameLower: { $nin: filteredModsArray },
      hideStats: null,
    },
    (err, allUsers) => {
      if (err) {
        console.log(err);
      } else {
        User.find(
          { usernameLower: { $in: filteredModsArray } },
          (err, allMods) => {
            if (err) {
              console.log(err);
            } else {
              res.render('community', {
                users: allUsers,
                mods: allMods,
                // @ts-ignore
                currentUser: req.user,
                headerActive: 'community',
              });
            }
          }
        );
      }
    }
  )
    .limit(150)
    .sort({ totalGamesPlayed: -1 });
});

export default router;
