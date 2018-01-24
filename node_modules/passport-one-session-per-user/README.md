# passport-one-session-per-user

This strategy check if the user that trying to connect is already connected in other sessions.
If so, it will disconnect the previous sessions.

How to install
---

	npm i -s passport-one-session-per-user

How to use
---

	var passportOneSessionPerUser=require('passport-one-session-per-user')
	passport.use(new passportOneSessionPerUser())
	app.use(passport.authenticate('passport-one-session-per-user'))

That's all.

**Note:** The information about sessionIDs, and users, is saved in memory. So it's not recommended when running in cluster, or multi process node.exe.

---

Pull requests are welcome :) So if you have any fix, please fork, and create pull request.