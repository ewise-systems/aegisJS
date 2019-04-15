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

const DEFAULT_ERR_OBJ = { code: -1, message: "Token or URL malformed. Request not sent." };

// @ts-ignore
const showFacade = x => x.isJust ? x.fold() : decoWithToPromise(new Task(rj => rj(DEFAULT_ERR_OBJ)));

// @ts-ignore
const requestToAegis = curry((method, jwt, body, path) =>
    compose(showFacade, map(invokeFetch(method, jwt, body)), getUrl(path))
);

module.exports = {
    showFacade,
    requestToAegis
};