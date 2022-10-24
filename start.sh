#!/bin/bash
# Set up Replications for Config Server, shards and router
docker compose exec dbRechnungConfig1 sh -c "mongosh < /scripts/init-configserver.js"
docker compose exec shard01rechnungsverwaltung1 sh -c "mongosh < /scripts/init-shard01-db-rechnungsverwaltung.js"
docker compose exec shard02rechnungsverwaltung1 sh -c "mongosh < /scripts/init-shard02-db-rechnungsverwaltung.js"
docker compose exec router01rechnungsverwaltung sh -c "mongosh < /scripts/init-router.js"

# Set Up Database and Collection for shards
docker exec shard01rechnungsverwaltung1 sh -c "mongosh < /scripts/createCollection.js"
docker exec shard02rechnungsverwaltung1 sh -c "mongosh < /scripts/createCollection.js"