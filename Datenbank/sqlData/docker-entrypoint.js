conn = new Mongo();

db = conn.getDB('backend');

db.createCollection("Rechnungen");

