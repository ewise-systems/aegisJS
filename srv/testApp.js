const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.get('/', async (req, res) => {
    const lib = path.resolve(__dirname, './public/index.html');
    res.sendFile(lib);
})

app.get('/aegis.js', async (req, res) => {
    const lib = path.resolve(__dirname, '../dist/aegis.js');
    res.sendFile(lib);
})

app.get('/samples/:file', async (req, res) => {
    const { file } = req.params;
    const lib = path.resolve(__dirname, `../samples/${file}`);
    res.sendFile(lib);
})

app.get('/json', async (req, res) => {
    res.write(JSON.stringify({ a: 1, b: 2 }));
    res.end();
})

app.listen(port, () => console.log(`Test app listening on port ${port}!`));