const { chain, map, pipe, toString } = require("ramda");
const {
    safeBase64ToBuffer,
    safeGetAegisUrl,
    safeJsonParse,
    safeNth,
    safeSplit
} = require("../fpcore/safeOps");

const getUrlFromJWT =
    pipe(
        safeSplit,
        chain(safeNth),
        chain(safeBase64ToBuffer),
        map(toString),
        chain(safeJsonParse),
        chain(safeGetAegisUrl)
    );

module.exports = {
    getUrlFromJWT
};