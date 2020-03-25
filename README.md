# ProAvalon

Online platform for The Resistance! [Play the game](https://www.ProAvalon.com).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) 13 preferred
- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
  - These are available together as Docker Desktop for [Mac](https://docs.docker.com/docker-for-mac/install/) and [Windows](https://docs.docker.com/docker-for-windows/install/)
  - Linux Docker comes with Docker Compose!

Here are some other useful resources:

- [Google Chrome](https://www.google.com/chrome/), a web browser with excellent debugging capabilities
- [Visual Studio Code](https://code.visualstudio.com/), a code editor/IDE by Microsoft
  - VS Code is also highly customizable. We recommend the following extensions:
    - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for code formatting
    - [npm](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script) and [npm Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense) for conveniently running scripts and autocompleting package names

### Windows users:

If you do not run Windows Pro or Enterprise, you will not be able to install Docker-Desktop. You have three options:

1. Buy a \$5 Windows Pro key online (I did this).
2. Download and attempt to run Docker-toolbox (I had unsuccessful results here).
3. Download the dependencies individually (NodeJS, MongoDB, Redis) and set up each one independently.

### Set up development environment: (If you want to contribute)

1. Create a Github account.
2. Set up your SSH keys using git's `ssh-keygen`.
3. Fork this repository via Github.

### Installing

1. Clone the repository. Replace the clone url with your forked repository if required.

```
> cd path/to/parent/folder
> git clone https://github.com/vck3000/ProAvalon.git
> cd ProAvalon
> git checkout newPA
```

2. Install node modules. Local installation of the packages is required for intellisense.

```
> npm install # This will install lerna and the pre-commit hooks.
> npm install -g lerna # This will install lerna globally
> npm run bootstrap # This will install all of the required dependencies in each package
```

3. Set up environment variables. Copy `.env.example` and rename it to `.env`.

```
> cp .env.example .env
```

4. Edit the .env file if required.

5. Build the containers. You only need to do this once at the start and any time you update npm packages.

```
> docker-compose up --build # this creates the containers for the front and back end of our code and starts the containers.
```

### Running

```
> docker-compose up # starts the containers
```

### Stopping

```
> docker-compose down # stops the containers
```

### In-built developer tools

The Docker-compose file spins up all the dependencies in one command.
This includes:

- Redis (in memory database)
- MongoDB (database)
- Mongo-express (web interface for MongoDB)

To access Mongo-express' web interface, simply go to `localhost:8081`.

To manually connect to Redis via the CLI:

```
> docker run -it --name redis_CLI --net proavalon_default --link cache:redis --rm redis redis-cli -h redis -p 6379
```

If the above does not work, run `docker container ls` and replace `cache` with redis' container name. Otherwise, double check the network name via `docker network ls`.

NOTE: Database data is persisted in `./database_data/`.

### Docker limitations

When a new npm package is installed in `packages/backend` or `packages/frontend`, the docker images must be rebuilt. Since this is a fairly long process, an alternative solution is to enter the docker container and `npm install` a second time.

```
> docker container ls
> docker exec -it <container_id> /bin/bash
> ... (`cd` and `npm install --save` package)
```

## Overview

This is a new complete rewrite of ProAvalon. It is currently in development stage.

Unlike the previous write of ProAvalon, this time around there will be a large focus on code quality and maintenance. In addition, there will also be a heavy focus on performance and optimisation. This includes distributed servers and load-balancing for upscaling, containerisation of apps for ease of deployment as well as automated regulation of code style using ESLint and Prettier.

The planned infrastructure is as follows:

- Digital ocean droplet to host servers.
- Nginx to manage routing
- Circle CI for CI/CD

The planned dependencies/frameworks are as follows:

- [NodeJS](https://nodejs.org/en/) + [Express](https://expressjs.com/) for backend.
- [Next.js](https://nextjs.org/) + [React](https://reactjs.org/) + [Redux](https://redux.js.org/) + [Semantic](https://react.semantic-ui.com/) for front end.
- [MongoDB](https://www.mongodb.com/) for main database.
- [Redis](https://redis.io/) for session and socket management.

[Typescript](https://www.typescriptlang.org/) will be used for both front end and backend.

This respository is a 'mono-repo' and is split into two separate packages, `packages/backend` and `packages/frontend`, each with their own set of configuration files.

## Contributing

If you are new to coding and would like to help contribute, we highly recommend [this course on Udemy](https://www.udemy.com/the-web-developer-bootcamp/) made by Colt Steel. [This useful guide](https://github.com/firstcontributions/first-contributions) and [this video tutorial](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github) are also great places to get started. Small contributions are always welcome!

When contributing, please make a new branch and then make a pull request. If you require any help, throw me a message through Discord or through the server. (Link to the server is included in this Github repository)
