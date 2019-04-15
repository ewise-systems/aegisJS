// @ts-ignore
const { compose, curry, map } = require("ramda/es");
// @ts-ignore
const { invokeFetch, decoWithToPromise } = require("./invokeFetch");
// @ts-ignore
const { getUrl } = require("./getUrl");
// @ts-ignore
const { decorateClassInstance: decorate } = require("../fpcore/pointfree");
// @ts-ignore
const Task = require("../structs/Task");

// @ts-ignore
const showFacade = x => x.isJust ? x.fold() : decoWithToPromise(Task.of(null));

// @ts-ignore
const requestToAegis = curry((method, jwt, body, path) =>
    compose(showFacade, map(invokeFetch(method, jwt, body)), getUrl(path))
);

module.exports = {
    showFacade,
    requestToAegis
};