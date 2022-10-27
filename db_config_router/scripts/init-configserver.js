rs.initiate({_id: "rechnungsverwaltung-mongodb-config-server", configsvr: true,
    version: 1, members: [
        { _id: 0, host : 'db-rechnung-config1:27017' },
        { _id: 1, host : 'db-rechnung-config2:27017' },
        { _id: 2, host : 'db-rechnung-config3:27017' }
    ] })