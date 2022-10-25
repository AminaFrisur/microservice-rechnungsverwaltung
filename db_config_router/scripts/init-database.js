sh.enableSharding('backend');
db.createCollection('backend.invoices');
db.invoices.createIndex( { loginName: "text" });
db.invoices.createIndex( { "rechnungsNummer": 1 }, { unique: true } );
db.adminCommand( { shardCollection: 'backend.invoices', key: { 'loginName': 'hashed' } } );