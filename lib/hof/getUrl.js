const { pipe } = require("ramda");
const { getUrlFromJWT } = require("./dataManip");
const { safeIsWebUri, safeMakeWebUrl } = require("../fpcore/safeOps");

// isUrlOrJwt :: (JWT string | URL string) -> ?(URL string)
const isUrlOrJwt = x =>
    getUrlFromJWT(x).getOrElse(null) ||
    safeIsWebUri(x).getOrElse(null);

// getUrl :: JWT string -> string
const getUrl = path =>
    pipe(
        isUrlOrJwt,
        safeMakeWebUrl(path)
    );

module.exports = {
    isUrlOrJwt,
    getUrl
};