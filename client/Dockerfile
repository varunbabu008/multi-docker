# Build stage
FROM node:18-alpine as build
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx
COPY --from=build /app/build /usr/share/nginx/html

