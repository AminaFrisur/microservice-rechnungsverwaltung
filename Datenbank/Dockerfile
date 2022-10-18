FROM mongo:latest
LABEL description="Database of Microservice Fuhrpark"
COPY ./sqlData/docker-entrypoint.js /docker-entrypoint-initdb.d/
CMD ["mongod"]