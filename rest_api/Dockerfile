FROM node:18.12.1-alpine
LABEL description="Rest Api fuer Microservice Rechnungsverwaltung mit Node.js"

# Set working directory
WORKDIR ./rest-api/

COPY src/ ./
RUN npm install

CMD [ "node", "server.js" ]


