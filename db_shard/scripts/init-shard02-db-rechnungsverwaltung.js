rs.initiate({_id: "shard-02-db-rechnungsverwaltung",
    version: 1, members: [
        { _id: 0, host : "shard-02-rechnungsverwaltung1:27017" },
        { _id: 1, host : "shard-02-rechnungsverwaltung2:27017" },
        { _id: 2, host : "shard-02-rechnungsverwaltung3:27017" }, ] });