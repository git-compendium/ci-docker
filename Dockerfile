FROM node:24
WORKDIR /src
COPY package*.json /src/
RUN npm i --omit=dev
COPY server.js routes.js index.html /src/
CMD ["npm", "start"]
