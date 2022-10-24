conn = new Mongo();

db = conn.getDB('backend');

db.createCollection("invoices");

db.invoices.createIndex( { "rechnungsNummer": 1 }, { unique: true } );

