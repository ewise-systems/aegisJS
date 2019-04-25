const { curry, chain, pipe } = require("ramda");
const { rejected } = require("folktale/concurrency/task");
const { getUrl } = require("./getUrl");
const { callFetch } = require("./callFetch");
const { either } = require("../fpcore/pointfree");

const requestToAegis = curry((method, jwt, body, path) =>
    pipe(
        getUrl(path),
        either(
            rejected,
            chain(callFetch(method, jwt, body))
        )
    )
);

const requestToAegisWithToken = ({method, jwt, body, path, tokenOrUrl}) =>
    requestToAegis(method, jwt, body, path)(tokenOrUrl);

module.exports = {
    requestToAegis,
    requestToAegisWithToken
};