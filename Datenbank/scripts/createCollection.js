new Mongo().getDB('backend').createCollection("invoices");
new Mongo().getDB('backend').invoices.createIndex( { "rechnungsNummer": 1 }, { unique: true } );