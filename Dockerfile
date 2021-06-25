# syntax=docker/dockerfile:1

# DEVELOPMENT BUILD
from node:16.3.0 as build
ENV NODE_ENV=development
WORKDIR /app

COPY ["package.json", "yarn.lock", "tsconfig.json", "webpack.*.js" , "./"]

RUN yarn --frozen-lockfile --non-interactive

COPY ./assets ./assets
COPY ./src ./src

RUN yarn build

# PRODUCTION BUILD
from node:16.3.0-alpine3.11 as production
ENV NODE_ENV=production
WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn --frozen-lockfile --non-interactive

COPY --from=build /app/assets ./assets
COPY --from=build /app/out ./out

RUN mkdir logs

CMD exec yarn start >> logs/out.log 2>> logs/err.log
