'use strict';


// TODO: GENERELL -> Authentifizierung zwischen Microservices muss noch umgesetzt werden

const express = require('express');
const bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json({ type: 'application/json' });
// Constants
const PORT = 8001;
const HOST = '0.0.0.0';
const { MongoClient } = require("mongodb");
const uri = "mongodb://0.0.0.0:27017";
const client = new MongoClient(uri);

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
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Connected successfully to server");
        res.send(200, "response");

    } finally {
        await client.close();
    }
});

app.get('/getInvoice/:id', [jsonBodyParser], async function (req, res) {
    res.send(200, "response");

});

app.post('/createInvoice', [jsonBodyParser], async function (req, res) {

});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});