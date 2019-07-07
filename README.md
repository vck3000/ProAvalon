# ProAvalon

Online platform for The Resistance! [Play the game](https://www.ProAvalon.com).


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Pre-requisites

What things you need to install the software and how to install them
- [Node.js](https://nodejs.org/en/) v7.6 or later
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

Things that I use that you may find useful:
- [Visual Studio Code](https://code.visualstudio.com/), a code editor/IDE by Microsoft
- [ConEmu](https://conemu.github.io/) (Windows program to open multiple cmds (terminals) in one window

### Installing

1. Clone (using git) a copy of the code:
```
> cd C:/YourFolder
> git clone https://github.com/vck3000/ProAvalon.git
```

2. Set up the required environment variables on your machine:
```
MY_PLATFORM = "local"
MY_SECRET_KEY = "AnythingThatYouWant"
DATABASEURL = "mongodb://localhost/TheNewResistanceUsers"
```
To do this on Mac, run the following in your terminal:
```
> export MY_PLATFORM=local
> export MY_SECRET_KEY=INSERT_ANYTHING_YOU_WANT
> export DATABASEURL=mongodb://localhost/TheNewResistanceUsers
```

3. Create the database in MongoDB:
    1. Start the database (Note: You may need to create folder `C:/data/db` to start the database server correctly, read the message in your terminal):
    ```
    > mongod
    ```
    2. Open a mongo shell (in a new terminal or command prompt):
    ```
    > mongo
    ```
    3. Create the database:
    ```
    > use TheNewResistanceUsers
    switched to db TheNewResistanceUsers
    ```

4. Install Node modules
```
> npm install
```

5. Optional: (This will install nodemon globally)
```
>  npm install -g nodemon
```


## Running

```
> node app.js
```
Or with nodemon (automatically restarts the server when changes are saved):
```
> nodemon app.js
```


## Linting

The rules are specified in `.eslintrc.json`. See https://eslint.org for more information on ESLint.
```
> npm run lint
```
Your code will also automatically lint whenever you commit.

## Optional: Create an admin account

On the registration page, create an account ProNub with any password you like.
Or you can edit the admins file and not stage it in your future commits.


## Overview

This is a Node.js express application that is currently deployed on Heroku. There are three stages: Production (live server), Development/staging (master branch of this repo) and other Heroku servers for each pull request.

When a pull request is made, a Heroku server is generated with those changes. Testing can be done on that online server. I will find a way to provide the link when you make the pull request if possible.

After a pull request has been merged to master, it will be on the development server. When approved, I will promote it to the production server.

---

User authentication is handled by Passport.js and client-server communication is handled by Socket.io. They are combined by [passport.socketio](https://www.npmjs.com/package/passport.socketio).

The server is run from `app.js`. 

Routes are all under the `routes` folder. `index.js` is the upper most layer (most broad).

After users log in, they are redirected to the lobby page where `sockets/sockets.js` handles socket communication.

All scripts and stylesheets are under the assets folder.`lobby.ejs` is perhaps the most complicated. I have broken the file down into smaller pieces and required them at the bottom of `lobby.ejs`.

There is a server-wide cache of 30 minutes for all files. This helps cut down on data usage, while also solving the issue of certain iPhone devices "flashing" every game iteration (the browser would re-download each image every time before caching was introduced).

There is also a `middleware` folder which contains useful functions mainly for authentication purposes on forums and profiles. 

Other useful global functions can be found under the `myFunctions` folder. 


## Contributing

If you are new to coding and would like to help contribute, I highly recommend [this course on Udemy](https://www.udemy.com/the-web-developer-bootcamp/) made by Colt Steel. It gave me the starting nudge I needed to make this site. Small contributions are always welcome!

When contributing, please make a new branch and then make pull request. If you require any help, throw me a message through Discord or through the server. (Link to the server is included in this Github repository)


## Acknowledgments

- Ref-rain and Hakha3 for their immense suppport and continuous user feedback for the site.
