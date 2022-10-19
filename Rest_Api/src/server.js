'use strict';


// TODO: GENERELL -> Authentifizierung zwischen Microservices muss noch umgesetzt werden

const express = require('express');
const bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json({ type: 'application/json' });
// Constants
const PORT = 8001;
const HOST = '0.0.0.0';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const dbconfig = {
    url: 'mongodb://database_rechnungsverwaltung:27017',
    user: 'admin',
    pwd: 'test1234'
}

// definiere ein Schema
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const rechnung = new Schema({
    id: ObjectId,
    rechnungsNummer: Number,
    rechnungsDatum: Date,
    // Ebenfalls auch hier Vorsicht wegen verteilten Transaktionenen !
    loginName: String,
    vorname: String,
    nachname: String,
    Straße: String,
    Hausnummer: String,
    // Hier vorsicht: theoretisch eine verteile DB Transaktion
    // Da aber keine Fahrzeuge gelöscht werden, kann hier nichts passieren deshalb OK !
    fahrzeugId: Number,
    fahrzeugTyp: String,
    fahrzeugModel: String,
    dauerDerBuchung: String,
    preisNetto: Number,
    bezahlt: Boolean
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
            res.send(401).send(error);
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
        await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd});
        console.log("Verbindung zur DB war erreich!")
        const rechnungen = rechnungenDB.find({});
        console.log(rechnungen);
        res.send(200, rechnungen)
    } catch(err){
        console.log(err);
        res.send(404, "something went wrong");
    }
});

app.get('/getInvoice/:rechnungsNummer', [jsonBodyParser], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd});
        res.send(200, "test")
    } catch(err){
        console.log('db error');
        res.send(404, "something went wrong");
    }

});

app.get('/getInvoiceByUser/:loginName', [jsonBodyParser], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd});
        res.send(200, "test")
    } catch(err){
        console.log('db error');
        res.send(404, "something went wrong");
    }

});

app.get('/createInvoice', [jsonBodyParser], async function (req, res) {
    try {
        await mongoose.connect(dbconfig.url, {useNewUrlParser: true, user: dbconfig.user, pass: dbconfig.pwd, dbName: "backend"});
        await rechnungenDB.create({
            rechnungsNummer: 1,
            rechnungsDatum: Date.now(),
            loginName: "test123",
            vorname: "tim",
            nachname: "hoeffner",
            Straße: "beispielsstraße",
            Hausnummer: "12",
            fahrzeugId: 1,
            fahrzeugTyp: "SUV",
            fahrzeugModel: "Tesla",
            dauerDerBuchung: "2 Std",
            preisNetto: 20,
            bezahlt: false
        });
        // const m = new rechnungenDB({});
        // await m.save(); // works

        res.send(200, "Rechnung wurde erfolgeich erstellt")
    } catch(err){
        console.log('db error');
        res.send(404, "something went wrong");
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});