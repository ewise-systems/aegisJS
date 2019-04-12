const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser');
const useragent = require('express-useragent');
const device = require('express-device');

const port = 3000;
const cors = require('cors')
const app = express();

app.use(useragent.express());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(device.capture({ parseUserAgent: true }));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', 'https://pdv.ewise.com:8443/');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // Pass to next layer of middleware
    next();
});

app.use(cors());
app.options('*', cors());
app.options('/*', (req, res, next) => res.sendStatus(200));

app.get('/', async (req, res) => {
    const lib = path.resolve(__dirname, './public/index.html');
    res.sendFile(lib);
})

app.get('/ew.js', async (req, res) => {
    const lib = path.resolve(__dirname, '../dist/index.js');
    res.sendFile(lib);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))