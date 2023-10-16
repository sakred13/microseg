FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN mv -f /usr/src/app/configs/storageConfig_linux.json /usr/src/app/configs/storageConfig.json 
RUN mv -f /usr/src/app/configs/dbconfigs_linux.json /usr/src/app/configs/dbconfigs.json 

RUN mkdir uploads
RUN chmod +x deploy.sh
RUN chmod +x deploy_companion.sh

EXPOSE 3001
EXPOSE 3020

CMD ["sh", "-c", "./deploy.sh" ]

# & ./deploy_companion.sh"