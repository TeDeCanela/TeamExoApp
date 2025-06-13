FROM node:18

WORKDIR /app

COPY . .

COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "servicios/serviciosgRPC/grcpNotificacion/index.js"]
