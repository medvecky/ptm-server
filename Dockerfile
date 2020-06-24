FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

#RUN npm i -g @nestjs/cli
RUN npm install

COPY . .

RUN npm run prebuild
RUN npm run build



EXPOSE 3000
#CMD [ "nest", "start" ]
CMD ["node", "dist/main"]