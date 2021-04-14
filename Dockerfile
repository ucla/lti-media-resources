FROM node:14-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

EXPOSE 8080

RUN yarn install
RUN yarn build

CMD ["node", "/usr/src/app/src/server/index.js"]
