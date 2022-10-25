'use strict';
// TODO: GENERELL -> Authentifizierung zwischen Microservices muss noch umgesetzt werden
// TODO: Aufsteigende Rechnungsnummern !

const express = require('express');
const bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json({ type: 'application/json' });
// Constants
const PORT = 8000;
const HOST = '0.0.0.0';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const dbconfig = {
    url: 'mongodb://router01rechnungsverwaltung/backend',
    user: 'admin',
    pwd: 'test1234'
}

// Dadurch das Javascript Thread Safe ist muss hier keine Synchronisierung stattfinden !
// Wird bei CreateInvoice hochgezählt
// Falls es doch zu einem doppelten Wert in der DB führt, gibt die MongoDB durch unique Index Konfiguration einen Fehler zurück
// Also kann keine Rechnung in der DB erscheinen die eine doppelte Rechnungsnummer besitzt
let aktuelleRechnungsNummer = 0;

// definiere ein Schema
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// javascript code wird immer nur seriel ausgeführt
// das bedeutet, das alle Funktionen auch Threadsafe sind
// somit brauchen wir auch keine synchronisation innerhalb eine nodejs instanz
// anders ist dies bei Microservices und der beispielhaften Skalierung der REST API
// deshalb wird aufjedenfall eine Synchronisierung innerhalb dieser Architektur benötigt

const rechnung = new Schema({
    id: ObjectId,
    rechnungsNummer: Number,
    rechnungsDatum: Date,
    // Ebenfalls auch hier Vorsicht wegen verteilten Transaktionenen !
    loginName: String,
    vorname: String,
    nachname: String,
    straße: String,
    hausnummer: String,
    plz: Number,
    // Hier vorsicht: theoretisch eine verteile DB Transaktion
    // Da aber keine Fahrzeuge gelöscht werden, kann hier nichts passieren deshalb OK !
    fahrzeugId: Number,
    fahrzeugTyp: String,
    fahrzeugModel: String,
    dauerDerBuchung: String,
    preisNetto: Number,
    bezahlt: Boolean,
    storniert: Boolean,
});

const rechnungenDB = mongoose.model('Invoice', rechnung);

function checkParams(req, res, requiredParams) {
    console.log("checkParams", requiredParams);
    let paramsToReturn = {};
    for (let i = 0; i < requiredParams.length; i++) {
            let param = requiredParams[i];
            
        if (!(req.query && param in req.query)
            && !(req.body && param in req.body)
            && !(req.params && param in req.params)) {
            let error = "error parameter " + param + " is missing";
            console.log(error);
            throw error;
            return;
        }

        if (req.query && param in req.query) {
            paramsToReturn[param] = req.query[param];
        }
        if (req.body && param in req.body) {
            paramsToReturn[param] = req.body[param];
        }
        if (req.params && param in req.params) {
            paramsToReturn[param] = req.params[param];
        }
    }
    return  paramsToReturn;
}

// App
const app = express();

// api call für eventuelle Statistiken
app.get('/getInvoices', [jsonBodyParser], async function (req, res) {
    try {
        // await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd});
        await mongoose.connect("mongodb://router01rechnungsverwaltung/backend");
        console.log("Verbindung zur DB war erreich!")
        const rechnungen = rechnungenDB.find({});
        console.log(rechnungen);
        res.status(200).send(rechnungen);
    } catch(err){
        console.log(err);
        res.status(401).send(err);
    }
});

app.get('/getInvoice/:rechnungsNummer', [jsonBodyParser], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd});
        res.send(200, "test");
    } catch(err){
        console.log('db error');
        res.status(401).send(err);
    }

});

app.get('/getInvoiceByUser/:loginName', [jsonBodyParser], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd});
        res.send(200, "test");
    } catch(err){
        console.log('db error');
        res.status(401).send(err);
    }

});

app.post('/createInvoice', [jsonBodyParser], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url, {useNewUrlParser: true, dbName: "backend"});
        let params = checkParams(req, res,["loginName", "vorname", "nachname", "straße",
                                                        "hausnummer", "plz", "fahrzeugId", "fahrzeugTyp", "fahrzeugModel",
                                                        "dauerDerBuchung", "preisNetto"]);
        // Dies funktioniert da javascript generell single Thread Modus arbeitet
        // Sobald das await kommt wird der code oben für die nächste Anfrage ausgeführt
        // Somit ist dieses Aufzählen Thread sicher !
        // Problem: Bei Skalierung muss dies auch abgestimmt werden
        // Deshalb TODO: Aufbau eines Datenbank Cluster Systems das mithilfe von Triggern die Rechnungsnummern bestimmt ! -> ist doch nicht nötig, da der Cluster die Unique Key Eigenschaft über den Cluster gewährleistet
        // Wird auch für die anderen Microservices wichtig
        // TODO: Loadbalancing für Router selber konfigurieren
        aktuelleRechnungsNummer = aktuelleRechnungsNummer + 1;
        await rechnungenDB.create({
            rechnungsDatum: Date.now(),
            rechnungsNummer: aktuelleRechnungsNummer,
            loginName: params.loginName,
            vorname: params.vorname,
            nachname: params.nachname,
            straße: params.straße,
            hausnummer: params.hausnummer,
            plz: params.plz,
            fahrzeugId: params.fahrzeugId,
            fahrzeugTyp: params.fahrzeugTyp,
            fahrzeugModel: params.fahrzeugModel,
            dauerDerBuchung: params.dauerDerBuchung,
            preisNetto: params.preisNetto,
            bezahlt: false,
            storniert: false
        });
        res.send(200, "Rechnung wurde erfolgeich erstellt")
    } catch(err){
        console.log('db error');
        res.status(401).send(err);
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});