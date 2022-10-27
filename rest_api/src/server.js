'use strict';
// TODO: GENERELL -> Authentifizierung zwischen Microservices muss noch umgesetzt werden
// TODO: Umgebungsvariablen beim Start des Containers mit einfügen -> Umgebungsvariable für Router MongoDB
const express = require('express');
const bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json({ type: 'application/json' });
// Constants
const PORT = 8000;
const HOST = '0.0.0.0';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const dbconfig = {
    url: 'mongodb://router-01-rechnungsverwaltung/backend',
    user: 'admin',
    pwd: 'test1234'
}

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
    buchungsNummer: Number,
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
    preisBrutto: Number,
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
app.get('/getInvoices', async function (req, res) {
    try {
        // await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd});
        await mongoose.connect(dbconfig.url);
        const rechnungen = await rechnungenDB.find({});
        res.status(200).send(rechnungen);
    } catch(err){
        console.log(err);
        res.status(401).send(err);
    }
});

app.get('/getInvoice/:rechnungsNummer', async function (req, res) {
    try {
        let params = checkParams(req, res,["rechnungsNummer"]);
        await mongoose.connect(dbconfig.url)
        const rechnung = await rechnungenDB.find({"rechnungsNummer": params.rechnungsNummer });
        res.status(200).send(rechnung);
    } catch(err){
        console.log('db error');
        res.status(401).send(err);
    }

});

app.get('/getInvoiceByUser/:loginName', async function (req, res) {
    try {
        let params = checkParams(req, res,["loginName"]);
        await mongoose.connect(dbconfig.url)
        const rechnung = await rechnungenDB.find({"loginName": params.loginName});
        res.status(200).send(rechnung);
    } catch(err){
        console.log('db error');
        res.status(401).send(err);
    }

});

app.post('/createInvoice', [jsonBodyParser], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url);
        let params = checkParams(req, res,["buchungsNummer","loginName", "vorname", "nachname", "straße",
                                                        "hausnummer", "plz", "fahrzeugId", "fahrzeugTyp", "fahrzeugModel",
                                                        "dauerDerBuchung", "preisNetto"]);


        let aktuelleRechnung = await rechnungenDB.findOne({}, null, {sort: {rechnungssNummer: 1}});
        let aktuelleRechnungsNummer = 1;

        // Wenn keine Buchungen vorhanden sind
        if(aktuelleRechnung) {
            aktuelleRechnungsNummer = aktuelleRechnung.rechnungsNummer + 1;
        }

        console.log(aktuelleRechnungsNummer);
        await rechnungenDB.create({
            rechnungsDatum: Date.now(),
            rechnungsNummer: aktuelleRechnungsNummer,
            buchungsNummer: params.buchungsNummer,
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
            preisBrutto: preisNetto * 1.19,
            bezahlt: false,
            storniert: false
        });
        res.send(200, "Rechnung wurde erfolgeich erstellt");
    } catch(err){
        console.log('db error');
        res.status(401).send(err);
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});
