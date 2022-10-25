rs.initiate({_id: "shard-02-db-rechnungsverwaltung",
    version: 1, members: [
        { _id: 0, host : "shard02rechnungsverwaltung1:27017" },
        { _id: 1, host : "shard02rechnungsverwaltung2:27017" },
        { _id: 2, host : "shard02rechnungsverwaltung3:27017" }, ] });