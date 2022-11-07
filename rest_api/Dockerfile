FROM node:19.0.0-alpine
LABEL description="Rest Api fuer Microservice Rechnungsverwaltung mit Node.js"

# Set working directory
WORKDIR ./rest-api/

COPY src/ ./
RUN npm install rollup && npm install @rollup/plugin-node-resolve && npm install @rollup/plugin-commonjs && npm install @rollup/plugin-json
RUN npm install & npm start

CMD [ "node", "server.js" ]


