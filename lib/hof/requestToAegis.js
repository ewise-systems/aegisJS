const { curry, chain, pipe } = require("ramda");
const { rejected } = require("folktale/concurrency/task");
const { getUrl } = require("./getUrl");
const { callFetch } = require("./callFetch");
const { either } = require("../fpcore/pointfree");

const showErrorTask = rejected

const requestToAegis = curry((method, jwt, body, path) =>
    pipe(
        getUrl(path),
        either(
            showErrorTask,
            chain(callFetch(method, jwt, body))
        )
    )
);

module.exports = {
    requestToAegis
};