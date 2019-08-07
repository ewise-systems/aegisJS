const mb = require("mountebank");
const { addService } = require("./addService");

const contract = require("./imposters");

const port = 5000;

mb.create({
    port,
    pidfile: "../mb.pid",
    logfile: "../mb.log",
    protofile: "../protofile.json",
    ipWhitelist: ["*"]
})
.then(() =>
    addService(port, contract)
);