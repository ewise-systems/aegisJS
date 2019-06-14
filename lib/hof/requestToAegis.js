const { curry, chain, pipe } = require("ramda");
const { rejected } = require("folktale/concurrency/task");
const { getUrl } = require("./getUrl");
const { callFetch } = require("./callFetch");
const { either } = require("../fpcore/pointfree");

// requestToAegis :: string -> JWT string -> JSON string -> URLPath string -> Task a b
const requestToAegis = curry((method, jwt, body, path) =>
    pipe(
        getUrl(path),
        either(
            rejected,
            chain(callFetch(method, jwt, body))
        )
    )
);

// requestToAegisWithToken :: { method :: string, jwt :: JWT string, body :: JSON string, path :: URLPath string } -> Task a b
const requestToAegisWithToken = ({method, jwt, body, path, tokenOrUrl}) =>
    requestToAegis(method, jwt, body, path)(tokenOrUrl);

module.exports = {
    requestToAegis,
    requestToAegisWithToken
};