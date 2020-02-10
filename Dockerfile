FROM node:13

# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./
RUN npm install

# Copying source files - Don't do this for dev env cos we will map volumes
# COPY . .

# Dev mode
CMD [ "npm" , "run",  "dev" ]

# Building app
# RUN npm run build

# # Running the app
# CMD [ "npm", "start" ]