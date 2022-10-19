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

app.get('/getInvoices', [jsonBodyParser], async function (req, res) {
    mongoose.connect(dbconfig.url, {
        useNewUrlParser: true,
        user: dbconfig.user,
        pass: dbconfig.pwd
    }).then(() => {
        console.log('successfully connected to the database');
        res.send(200, "response");
    }).catch(err => {
        console.log('error connecting to the database');
        res.send(404, "response");
    });
});

app.get('/getInvoice/:id', [jsonBodyParser], async function (req, res) {
    res.send(200, "response");

});

app.post('/createInvoice', [jsonBodyParser], async function (req, res) {

});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});