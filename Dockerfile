# develop stage
FROM node:8.8-alpine as develop-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# build stage
FROM develop-stage as build-stage
# Custom build with / as the url
ENV BASE_URL=/
RUN npm run build


# production stage
FROM nginx
LABEL maintainer="Cindy.vandeVriesSafaviNic@deltares.nl"
USER root

# update system and install dependencies

RUN apt-get update

COPY --from=build-stage /app/dist /usr/share/nginx/html
HEALTHCHECK CMD service nginx status || exit 1
# Expose http port
EXPOSE 80
# Allow user to overwrite the html, logs and configuration
VOLUME /etc/nginx
VOLUME /var/log/nginx/log
