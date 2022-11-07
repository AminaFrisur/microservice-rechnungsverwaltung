# microservice-rechnungsverwaltung
Rechnungsverwaltung mit Wasm

Stand 18.10:
- Idee ist: um nicht verteilte Datenbanken zu haben -> Speicherung der Rechnungen als Objekt
- Das bedeutet: Jede Rechnung wird als ganzen Objekt inklusive aller Attribute gespeichert
- Diese sind dann auch absolut unveränderlich !!
- Somit erstellung mithilfe von MongoDB !
- wird nur von Benutzerverwaltung und anderen MS Benutzt
- sollte also kein eigenens Frontend besitzen
- dient also nur der Erstellung und dem Abfragen von Rechnungen
- Aufbau des Objektes:
- Anschrift des Unternehmens
- Anschrift des Kunden (Auch wenn sich Benutzerdaten in MS Benutzerverwaltung ändern, bleibt die Rechnung gleich)
- Datum (Timestamp)
- Rechnungsnummer
- Rechnungsposten (In diesem Fall Buchungen)
- Rechnungsbetrag
- Siehe auch https://www.easybill.de/ratgeber/10-bestandteile-einer-rechnung

Stand 24.10:
- Um auch eine Datenbank Skalierung zu gewährleisten -> Datenbank Cluster
- Aufbau eines MongoDB CLusters ist dabei mega easy
- https://sleeplessbeastie.eu/2020/11/25/how-to-create-mongodb-cluster-using-docker/
- TODO: Schauen wie man Anfragen an Cluster übergibt 
- Gibt es auch einen Loadbalancer ?
- TODO: Trigger erstellen um Rechnungsnummer zu synchronisieren
- Cluster Tutorial: https://www.mongodb.com/compatibility/deploying-a-mongodb-cluster-with-docker
- Hier wichtig: Keine Replikation sondern die Daten sollen geteilt werden !
- Nennt sich bei MongoDB Shared Cluster -> https://university.mongodb.com/mercury/M103/2022_October_18/chapter/Chapter_3_Sharding/lesson/5aa312e396f30f818591a594/lecture
- MongOS -> Dort muss sich die Rest API verbinden -> das ist dann der Zentrale Anlaufpunkt für Statements
- Dahinter verbirgt sich quasi ein Routing Prozess
- Daten werden wiederum über Metadaten schnell gefunden
- Diese werden wiederum auf einem Config Server gespeichert 
- Damit die Metadaten schnell Verfügbar sind werden diese ebenfalls repleziert
- Sharding Architektur: https://university.mongodb.com/mercury/M103/2022_October_18/chapter/Chapter_3_Sharding/lesson/5aa31bc996f30f818591a59c/lecture
- Manual zu Sharded Cluster Komponenten: https://www.mongodb.com/docs/manual/core/sharded-cluster-components/
- Komponente 1: Shard -> Beinhaltet einen Teil der sharded Daten -> wird als Replica Set angelegt
- Komponente 2: Mongos -> Ist ein Query Router und ist die Schnittstelle zwischen Client und Sharded Cluster
- Komponente 3: Config Server -> Speichert Metadaten und Konfiguration über den Cluster -> ebenfalls nur deploybar als Replica Set
- Aktuell die wichtigste Doku dazu: https://github.com/minhhungit/mongodb-cluster-docker-compose

Stand 25.10:
- läuft jetzt alles
- Was noch fehlt: die Konfiguration des Loadbalancing für den Mongos Router
- Damit die Datensätze auch verteilt werden
- https://www.mongodb.com/docs/manual/core/sharded-cluster-query-router/
- Es muss der Shard Key noch richtig festgelegt werden !
- https://www.qualiero.com/community/mongodb/mongodb-theorie/den-richtigen-shard-key-auswaehlen.html
- Mein Sharded Key hier: loginName (A - H: Datenbank1) usw.
- Hashed Sharding Key:https://www.mongodb.com/docs/manual/core/hashed-sharding/
- https://www.mongodb.com/docs/manual/core/hashed-sharding/#std-label-sharding-hashed-sharding -> Hashed Sharding
- Es gibt ein Problem bei Hashed Index
- aktuell sind hashed indexed nicht eindeutig (Es kann zu Kollisionen kommen)
- aus diesem Grund aktuell nicht erlaubt
- Fehlermeldung von MongoDB: MongoServerError: Currently hashed indexes cannot guarantee uniqueness. Use a regular index.
- https://jira.mongodb.org/browse/SERVER-5878 -> Aktuelles Ticket dazu
- Deshalb muss eine andere Lösung gefunden werden
- Wie beispielsweise der Login Name
- Rechnungsnummer würde keinen Sinn ergeben, wegen der Aufzählung
- Stattdessen könnte man abhängig vom Anfangsbuchstaben des Login Namens die Daten aufteilen
- LÄUFT JETZT:
- WICHTIG: Erst loginNamen als Index text Index Feld anlegen
- Danach den Shared Key definiren der dann loginNamen hashed und damit verteilt
- Somit wird jetzt jedesmal der loginName gehashed und dann enstprechend dem jeweiligen Chunk/Shard zugewiesen
- Somit auch eine gute Verteilung möglich
- Zudem wenn ein User seine kompletten Rechnungen haben will -> nur in einem Shard
- Problem: Wenn neue hinzukommen kann sich das ganze nochmals etwas verteilen
- SOMIT DB FERTIG !!

Stand 06.11:
- In diesem Projekt wird hauptsächlich mit WasmEdge QuickJS gearbeitet#
- QuickJS ist dabei ein Javascript Interpreter
- Dieser wird innerhalb der WasmEdge Laufzeitumgebung ausgeführt
- Ich gehe hier davon aus, das quasi QuickJS den Javascript Code in WASM Code übersetzt 
- und dieser dann von der Laufzeitumgebung WasmEdge in richtigen Byte Code übersetzt wird
- Der Vorteil dann hier: Mit Nodejs ist kein Linux Container bei MS nötig
- Hier reicht dann auch einfach die Laufzeitumgebung WasmEdge aus (Virtuelle Stack Machine)
- Diese soll nach meiner Kenntnis nochmals Ressourcen schonender als ein Linux Container sein
- Somit Ziel bei diesem Projekt: Die Nodejs Anwendung mit WasmEdge zum laufen zu bringen
- Das Aktuelle PRoblem was ich dabei aber sehe: Wie sieht es auch mit der Verbindung zur DB, weil ja aktuell keine normalen Sockets Wasm Edge unterstüzt werden
- Muss somit einfach ausprobiert werden
- Hier wird es dann auch mehrere Varianten von MS geben: NodeJS Wasm Microservice (Also Standalone) und NodeJS Wasm mit Docker 
- Docker ist ja eine Laufzeitumgebung um Container zu managen
- Diese bietet aber mittlerweile auch Support für Wasm an 
- Seit dem 26.10.2022 (also ganz neu!)
- Jetzt zu Nodejs:
- https://wasmedge.org/book/en/write_wasm/js/nodejs.html
- WasmEdge hat aktuell auch das Ziel NodeJS APIs in WasmEdge QuickJS zu integrieren
- Ziel ist es ein unmodifiziertes Nodejs Program in WasmEdge QuickJS zum laufen zu bringen
- Das Bedeutet in der Zukunft: das aktuelle NodeJS Anwendungen einfach in WasmEdge laufen sollen
- Wichtig: das Modules Verzeichnis von NodeJS muss zugreifbar gemacht werden für WasmEdge
- Anscheinend müssen erst alle Module in ES6 Module umgewandelt werden
- Dies geschieht dann mit rollup.js
- https://rollupjs.org/guide/en/
- Mit Rollup ist ein bundler
- "fasse quasi alles in eine Javascript Datei zusammen"
- Tutorial: https://www.youtube.com/watch?v=IdxAJaKwuxQ
- Schritt 1: Installiere Rollup js
- Schritt 2: in der package json Datei: "scripts": {"start": "rollup src/server.js -o build/bundle.js -f cjs"}
- -o Output File
- -f bedeutet format
- cjs -> CommonJS Format
- Schritt 3: Config File für Rollup erstellen

Stand 07.11.2022:
- Rollup Bundle erfolgreich erstellt
- Hierfür waren bestimmte Plugins von Rollup nötig 
- https://github.com/rollup/plugins
- Es ist etwas komplizierter
- Wichtig war: Erstmal alles in Es6 umkonvertieren
- das commonjs plugin macht dies für die node_modules
- Aktuelles Ergebnis: Ich habe es soweit hinbekommen ein Bundle zu erstellen
- Problem: Es sind immernoch ein paar import statements dabei
- import path usw
- die muss ich noch rausbekommen
- ansonsten müsste es eigentlich gehen