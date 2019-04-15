// @ts-ignore
const { compose, curry, chain } = require("ramda/es");
// @ts-ignore
const { callFetch } = require("./callFetch");
// @ts-ignore
const { fetchToTask } = require("./fetchToTask");
// @ts-ignore
const { taskToPromise } = require("../fpcore/transforms");
// @ts-ignore
const { decorateClassInstance: decorate } = require("../fpcore/pointfree");

// @ts-ignore
const toPromise = task => () => taskToPromise(task);

// @ts-ignore
const decoWithToPromise = decorate('toPromise', toPromise);

// @ts-ignore
const makeFetchMonad = compose(decoWithToPromise, chain(fetchToTask), callFetch);

// @ts-ignore
const invokeFetch = curry((method, token, body, url) => makeFetchMonad(url, method, token, body));

module.exports = {
    toPromise,
    makeFetchMonad,
    decoWithToPromise,
    invokeFetch
};