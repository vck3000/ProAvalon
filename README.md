# ProAvalon

Online platform for The Resistance! [Play the game](https://www.ProAvalon.com).


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Pre-requisites

- [Docker](https://www.docker.com/products/docker-desktop) or (in alternative)
[Docker Toolbox](https://docs.docker.com/toolbox/overview/) (recommended if you don't know what is Docker)
- [Git](https://git-scm.com/)

Other useful resources:
- [Visual Studio Code](https://code.visualstudio.com/), a code editor/IDE by Microsoft

### Installing

1. Clone (using git) a copy of the code:
```
> cd path/to/your/folder
> git clone https://github.com/vck3000/ProAvalon.git
```

2. Set up the required environment variables on your machine:

Edit environment variables in docker/settings.env:
```
MY_PLATFORM = "local"
MY_SECRET_KEY = "AnythingThatYouWant"
```

## Running

1. Set up your Docker environment. If you use Docker, it should already be set. If you installed Docker Toolbox you should first start the Docker machine with:
```
> docker-machine start
```

2. When Docker is ready to take command line instructions you just need to run:
```
> docker-compose -f docker/docker-compose.yml up -d --build
```


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
