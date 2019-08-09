const mb = require("mountebank");
const { addService, writeContract } = require("./helper");
const { port, impostorPort200, impostorPort500, payload200, payload500 } = require("./settings");

mb.create({
    port,
    pidfile: "../mb.pid",
    logfile: "../mb.log",
    protofile: "../protofile.json",
    ipWhitelist: ["*"]
})
.then(() => {
    const contract500 = writeContract(impostorPort500, [
        {
            responses: [
                {
                    is: {
                        statusCode: 500,
                        headers: {
                            "Content-Type": "application/json",
                            "connection": "close"
                        },
                        body: payload500
                    }
                }
            ]
        }
    ]);
    addService(port, contract500);

    const contract200 = writeContract(impostorPort200, [
        {
            responses: [
                {
                    is: {
                        statusCode: 200,
                        headers: {
                            "Content-Type": "application/json",
                            "connection": "close"
                        },
                        body: payload200
                    }
                }
            ]
        }
    ]);
    addService(port, contract200);
});