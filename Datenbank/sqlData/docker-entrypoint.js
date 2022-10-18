conn = new Mongo();

db = conn.getDB('backend');

db.createUser({user: "backenduser", pwd: "test1234", roles: ["readWrite"]});

db.createCollection("Rechnungen");

