rs.initiate({_id: "rechnungsverwaltung-mongodb-config-server", configsvr: true,
    version: 1, members: [
        { _id: 0, host : 'dbRechnungConfig1:27017' },
        { _id: 1, host : 'dbRechnungConfig2:27017' },
        { _id: 2, host : 'dbRechnungConfig3:27017' }
    ] })