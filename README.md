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
- 