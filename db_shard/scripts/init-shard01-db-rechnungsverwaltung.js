rs.initiate({_id: "shard-01-db-rechnungsverwaltung",
    version: 1, members: [
        { _id: 0, host : "shard01rechnungsverwaltung1:27017" },
        { _id: 1, host : "shard01rechnungsverwaltung2:27017" },
        { _id: 2, host : "shard01rechnungsverwaltung3:27017" }, ] });
