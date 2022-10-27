FROM mongo:latest
LABEL description="Database Shards fuer Microservice Rechnungsverwaltung"
COPY ./scripts/ /scripts/
# COPY ./sqlData/docker-entrypoint.js /docker-entrypoint-initdb.d/
CMD ["mongod"]