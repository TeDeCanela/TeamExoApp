FROM node:18

WORKDIR /app

COPY . .

COPY ../../package*.json ./
RUN npm install

EXPOSE 50059

CMD ["node", "Recurso.js"]
