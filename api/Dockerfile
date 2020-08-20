FROM node:8-alpine
RUN mkdir -p /app

WORKDIR /app

COPY package.json /app/

RUN npm i --silent && npm cache clean --force

COPY . /app

EXPOSE 4000

CMD ["npm", "start"]
