'use strict';
import {checkAuth} from "./auth.js";

import express from 'express';
import bodyParser  from 'body-parser';
import CircuitBreaker from './circuitBreaker.js';
import Cache from "./cache.js";
import {default as mongoose} from 'mongoose';

var jsonBodyParser = bodyParser.json({ type: 'application/json' });

// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

// Definition CircuitBreaker
var circuitBreakerBenutzerverwaltung = new CircuitBreaker(150, 30, 0,
    -3, 10, 3,
    process.env.BENUTZERVERWALTUNG, process.env.BENUTZERVERWALTUNGPORT);

const middlerwareWrapperAuth = (cache, isAdmin, circuitBreaker) => {
    return (req, res, next) => {
        checkAuth(req, res, isAdmin, cache, circuitBreaker, next);
    }
}

// Definition Cache um Nutzer Auth Token zwischen zu speichern
var cache = new Cache(10000, 5000);


mongoose.Promise = global.Promise;
const dbconfig = {
    url: process.env.MONGODBROUTER,
    user: process.env.DBUSER,
    pwd: process.env.DBPWD
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
    storniert: false,
    gutschrift: Boolean
});

const rechnungenDB = mongoose.model('Invoice', rechnung);

function checkParams(req, res, requiredParams) {
    console.log("checkParams", requiredParams);
    let paramsToReturn = {};

    console.log(req.body);

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
// nur durch Admin
app.get('/getInvoices',[middlerwareWrapperAuth(cache, true, circuitBreakerBenutzerverwaltung)], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url);
        const rechnungen = await rechnungenDB.find({});
        res.status(200).send(rechnungen);
    } catch(err){
        console.log(err);
        res.status(401).send(err);
    }
});

app.get('/getInvoice/:rechnungsNummer', [middlerwareWrapperAuth(cache, false, circuitBreakerBenutzerverwaltung)], async function (req, res) {
    try {
        let params = checkParams(req, res,["rechnungsNummer"]);
        await mongoose.connect(dbconfig.url)
        const rechnung = await rechnungenDB.find({"rechnungsNummer": params.rechnungsNummer, "loginName": req.headers.login_name});
        res.status(200).send(rechnung);
    } catch(err){
        console.log('db error');
        res.status(401).send(err);
    }

});

app.get('/getInvoiceByUser/:loginName', [middlerwareWrapperAuth(cache, false, circuitBreakerBenutzerverwaltung)], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url)
        const rechnung = await rechnungenDB.find({"loginName": req.headers.login_name});
        res.status(200).send(rechnung);
    } catch(err){
        console.log('db error');
        res.status(401).send(err);
    }

});

// Wird nur vom Microservice Buchungsverwaltung aufgerufen
// Erstellung einer Gutschrift oder einer Rechnung
app.post('/createInvoice', [jsonBodyParser], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url);
        let params = checkParams(req, res,["buchungsNummer","loginName", "vorname", "nachname", "straße",
                                                        "hausnummer", "plz", "fahrzeugId", "fahrzeugTyp", "fahrzeugModel",
                                                        "dauerDerBuchung", "preisNetto", "gutschrift"]);

        let aktuelleRechnung = await rechnungenDB.findOne({}, null, {sort: {rechnungsNummer: -1}});
        console.log(aktuelleRechnung);
        let aktuelleRechnungsNummer = 0;

        // Wenn keine Buchungen vorhanden sind
        if(aktuelleRechnung) {
            aktuelleRechnungsNummer = aktuelleRechnung.rechnungsNummer;
        }

        aktuelleRechnungsNummer++;


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
            preisNetto: params.dauerDerBuchung * params.preisNetto,
            preisBrutto: params.dauerDerBuchung * params.preisNetto * 1.19,
            bezahlt: false,
            storniert: false,
            gutschrift: params.gutschrift
        });
        res.status(200).send("Rechnung wurde erfolgeich erstellt");
    } catch(err){
        console.log(err);
        res.status(401).send(err);
    }
});

// Wird nur vom Microservice Buchungsverwaltung aufgerufen
app.post('/markInvoiceAsPaid/:buchungsNummer', async function (req, res) {
    try {
        // await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd});
        let params = checkParams(req, res,["buchungsNummer"]);
        await mongoose.connect(dbconfig.url);
        const rechnungen = await rechnungenDB.find({"buchungsNummer": params.buchungsNummer});
        console.log(rechnungen)
        console.log(rechnungen[0]);
        console.log("Versuche jetzt die Recchnung als bezahl zu markieren");
        if(rechnungen && rechnungen[0] && !rechnungen[0].storniert) {
            rechnungen[0].bezahlt = true;
            rechnungen[0].save();
            res.status(200).send("Rechnung wurde bezahlt");
        } else {
            res.status(401).send("Rechnung wurde nicht gefunden oder ist schon storniert");
        }

    } catch(err){
        console.log(err);
        res.status(401).send(err);
    }
});

// Wird nur vom Microservice Buchungsverwaltung aufgerufen
app.post('/markInvoiceAsCancelled/:buchungsNummer', async function (req, res) {
    try {
        // await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd});
        let params = checkParams(req, res,["buchungsNummer"]);
        await mongoose.connect(dbconfig.url);
        const rechnungen = await rechnungenDB.find({"buchungsNummer": params.buchungsNummer});
        if(rechnungen && rechnungen[0] && !rechnungen[0].bezahlt) {
            rechnungen[0].storniert = true;
            rechnungen[0].save();
            res.status(200).send("Rechnung wurde storniert");
        } else {
            res.status(401).send("Rechnung wurde nicht gefunden oder ist schon bezahlt und kann deshalb nicht mehr storniert werden");
        }

    } catch(err){
        console.log(err);
        res.status(401).send(err);
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});
