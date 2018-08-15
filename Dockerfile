FROM node:8

# 80 = HTTP, 443 = HTTPS, 3000 = MEAN.JS server, 35729 = livereload, 8080 = node-inspector
EXPOSE 80 443 3000 35729 8080 4200

# Set development environment as default
ENV NODE_ENV development

WORKDIR /opt/beta-apps

COPY package*.json ./
COPY . .

RUN npm install
CMD npm start
