# Etapa de construcción
FROM node:20-alpine AS builder

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json .
COPY prisma ./prisma
COPY init.js .

RUN npm install

RUN npx prisma generate --schema=./prisma/schema.prisma

COPY . .

RUN npm run build

# Etapa de producción
FROM node:20-alpine

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/init.js .

EXPOSE 3000

CMD ["npm", "run", "init"]