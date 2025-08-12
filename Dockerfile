FROM node:18-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci --only=production

# Copia codice sorgente
COPY . .

# Build dell'applicazione
RUN npm run build

# Esponi porta
EXPOSE 3000

# Comando di avvio
CMD ["npm", "start"]
