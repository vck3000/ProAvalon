# ProAvalon

Online platform for The Resistance! [Play the game](https://www.ProAvalon.com).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Pre-requisites

- [Node.js](https://nodejs.org/en/) v12.0.0+
- [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) - Used to install MongoDB. If you prefer, you may skip Docker and install MongoDB directly.

Other useful resources:

- [Visual Studio Code](https://code.visualstudio.com/), a code editor/IDE by Microsoft.
- [nvm](https://github.com/nvm-sh/nvm), a useful tool to manage your node versions.

### Installing

1. If you intend on contributing, make a fork of ProAvalon.

2. Git clone a copy of the code:

```
$ cd path/to/your/folder

# Replace with your fork if applicable
$ git clone https://github.com/vck3000/ProAvalon.git
```

3. Make a copy of `.env.example` and name it `.env`.

```
$ cp .env.example .env
```

4. Install dependencies.

```
$ yarn
```

### Running

1. Start the database with: `docker-compose up`. Ensure Docker is running.
2. Start the server with: `yarn dev`.

### Stopping

1. Stop the server with `Ctrl+C`.
2. Stop the docker-compose stack with `Ctrl+C`.
3. Remove the containers from the docker-compose stack with `docker-compose down`.

### Misc

- To run local tests run `yarn test`.
- To run local tests in watch mode run `yarn test:watch`.
- To run local tests with coverage report run `yarn test:coverage`.

## Optional: Create an admin account

On the registration page, create an account ProNub with any password.

Alternatively, you can edit the admins file under `/src/modsadmins/admins.ts`and not stage it in your future commits.

## Overview

This is a Node.js express application that is currently deployed on Digital Ocean. There are three stages: Production (live server), Development/staging (master branch of this repo) and other Heroku servers for each pull request.

When a pull request is merged to master, GitHub Actions will trigger and produce docker containers. When approved, an admin will promote it to the production server.

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

When contributing, please make a new branch and then make pull request. If you require any help, feel free to make an issue, or contact an admin through Discord or through the [server](https://proavalon.com).

## Acknowledgments

- Ref-rain and Hakha3 for their immense suppport and continuous user feedback for the site.
