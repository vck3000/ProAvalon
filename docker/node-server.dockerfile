FROM node:13.10.1
WORKDIR /node-server
COPY package.json package.json
RUN npm install 
COPY . .
VOLUME /node-server/assets
VOLUME /node-server/gameplay
VOLUME /node-server/models
VOLUME /node-server/modsadmins
VOLUME /node-server/myFunctions
VOLUME /node-server/rewards
VOLUME /node-server/routes
VOLUME /node-server/sockets
VOLUME /node-server/views
ENTRYPOINT $(npm bin)/nodemon app.js
