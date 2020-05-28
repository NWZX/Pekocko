FROM node:10

RUN mkdir -p /user/src/app
WORKDIR /user/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]