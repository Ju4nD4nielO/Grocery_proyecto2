FROM node:18-alpine

WORKDIR /app

# Instalar dependencias primero (capa cacheada)
COPY package.json .
RUN npm install

# Copiar el schema de Prisma y generar el cliente
COPY prisma ./prisma
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

EXPOSE 3008
CMD ["node", "src/app.js"]