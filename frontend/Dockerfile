# Stage 1: build
FROM node:18-alpine AS build

WORKDIR /app

# Recibir la URL del backend como build argument
ARG VITE_API_URL=http://localhost:3008
ENV VITE_API_URL=$VITE_API_URL

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback + silenciar favicon 404
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / { try_files $uri $uri/ /index.html; }\n\
  location = /favicon.ico { log_not_found off; access_log off; }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80