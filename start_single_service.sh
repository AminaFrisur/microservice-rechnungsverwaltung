#!/bin/bash
docker compose stop -t 1 rest-api-rechnungsverwaltung1
docker compose rm rest-api-rechnungsverwaltung1
docker compose build rest-api-rechnungsverwaltung1
docker compose up --no-start rest-api-rechnungsverwaltung1
docker compose start rest-api-rechnungsverwaltung1
