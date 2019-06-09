FROM node:10-alpine

WORKDIR /usr/src/o-labs

COPY package*.json ./

RUN apk update && apk add bash
RUN npm install pm2 -g
RUN npm i


COPY build .
COPY wait-for-it.sh .

CMD [ "npm", "start"]