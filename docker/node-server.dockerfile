FROM node:13.10.1
WORKDIR /node-server
COPY package.json package.json
RUN npm install
COPY . .
ENTRYPOINT node app.js
