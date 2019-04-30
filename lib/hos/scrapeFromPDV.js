const { toObservable } = require("../frpcore/transforms");
const { kickstart$ } = require("./pollingCore");

const scrapeFromPDV$ = (jwt, csrf, body) =>
    kickstart$(
        ({ status }) => ["error", "partial", "stopped", "done"].indexOf(status) === -1,
        toObservable("POST", jwt, body, "/ota/process"),
        pid => toObservable("GET", jwt, null, `/ota/process/${pid}?challenge=${csrf}`)
    );

module.exports = {
    scrapeFromPDV$
};