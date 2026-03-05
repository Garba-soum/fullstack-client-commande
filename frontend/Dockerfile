# Étape 1 : Build Angular
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Étape 2 : Nginx
FROM nginx:alpine
COPY --from=build /app/dist/client-commande-front/browser/ /usr/share/nginx/html/

# ✅ AJOUTE ÇA :
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]