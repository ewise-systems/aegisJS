const { pipe } = require("ramda");
const { getUrlFromJWT } = require("./dataManip");
const { safeIsWebUri, safeMakeWebUrl } = require("../fpcore/safeOps");

const isUrlOrJwt = x =>
    getUrlFromJWT(x).getOrElse(null) ||
    safeIsWebUri(x).getOrElse(null);

const getUrl = path =>
    pipe(
        isUrlOrJwt,
        safeMakeWebUrl(path)
    );

module.exports = {
    isUrlOrJwt,
    getUrl
};