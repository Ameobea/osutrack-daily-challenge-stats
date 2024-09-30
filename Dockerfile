FROM node:20.9-slim AS builder

ADD . /app

WORKDIR /app

RUN yarn
RUN VITE_API_BASE_URL="https://osu-api-bridge.ameo.dev" yarn run build

FROM node:20.9-slim

WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

CMD node ./build/index.js
