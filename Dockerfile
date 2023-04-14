FROM node:18-alpine AS build
WORKDIR /app
COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN cp -R /tmp/node_modules .
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY package.json /tmp/package.json
RUN cd /tmp && npm install --production
RUN cp -R /tmp/node_modules .
COPY --from=build app/dist/ ./dist/
RUN ls -la ./dist/modules/
COPY package.json .
CMD [ "npm", "run", "start" ]
