FROM nginx
LABEL maintainer="Cindy.vandeVriesSafaviNic@deltares.nl"
USER root

# update system and install dependencies

RUN apt-get update

COPY dist /usr/share/nginx/html
HEALTHCHECK CMD service nginx status || exit 1
# Expose http port
EXPOSE 80
# Allow user to overwrite the html, logs and configuration
VOLUME /etc/nginx
VOLUME /var/log/nginx/log
