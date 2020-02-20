# ProAvalon

Online platform for The Resistance! [Play the game](https://www.ProAvalon.com).


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) v7.6 or later
- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
  - These are available together as Docker Desktop for [Mac](https://docs.docker.com/docker-for-mac/install/) and [Windows](https://docs.docker.com/docker-for-windows/install/)

Here are some other useful resources:

- [Google Chrome](https://www.google.com/chrome/), a web browser with excellent debugging capabilities
- [Visual Studio Code](https://code.visualstudio.com/), a code editor/IDE by Microsoft
  - VS Code is also highly customizable. We recommend the following extensions:
    - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for code formatting
    - [npm](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script) and [npm Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense) for conveniently running scripts and autocompleting package names
- [ConEmu](https://conemu.github.io/) (Windows program to open multiple cmds (terminals) in one window

### Installing

1. Clone this repository
```
> cd path/to/parent/folder
> git clone https://github.com/vck3000/ProAvalon.git
> cd ProAvalon
```

2. Install node modules
```
> npm install # this will install lerna in the root directory
> npm run bootstrap # this will run the "bootstrap" script in package.json, which installs all of the required dependencies
```

3. Set up environment variables
Create a `.env` file in the root directory with your environment variables. It should look something like this:
```
ENV=dev
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

4. Build the container
```
> docker-compose up --build # this creates the containers for the front and back end of our code
```

### Running
```
> docker-compose up # starts the containers
```

### Stopping
```
> docker-compose down # stops the containers
```


## Overview

This is a Node.js express application that is currently deployed on Heroku. There are three stages: production (live server), development/staging (master branch of this repo) and other Heroku servers for each pull request.

When a pull request is made, a Heroku server is generated with those changes. Testing can be done on that online server. I will find a way to provide the link when you make the pull request if possible.

After a pull request has been merged to master, it will be on the development server. When approved, I will promote it to the production server.

---

This repo is split into two separate packages, `packages/backend` and `packages/frontend`, each with their own configuration files.

The backend is written in TypeScript and is run from `backend/src/app.ts`.

The frontend uses [Next.js](https://nextjs.org/), a flexible React framework for multipage apps.

There is a server-wide cache of 30 minutes for all files. This helps cut down on data usage, while also solving the issue of certain iPhone devices "flashing" every game iteration (the browser would re-download each image every time before caching was introduced).


## Contributing

If you are new to coding and would like to help contribute, we highly recommend [this course on Udemy](https://www.udemy.com/the-web-developer-bootcamp/) made by Colt Steel. [This useful guide](https://github.com/firstcontributions/first-contributions) and [this video tutorial](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github) are also great places to get started. Small contributions are always welcome!

When contributing, please make a new branch and then make a pull request. If you require any help, throw me a message through Discord or through the server. (Link to the server is included in this Github repository)


## Acknowledgments

- Ref-rain and Hakha3 for their immense suppport and continuous user feedback for the site.
