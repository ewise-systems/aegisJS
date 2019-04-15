// @ts-ignore
const { compose, chain } = require("ramda/es");
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
const fetchMonad = compose(decorate('toPromise', toPromise), chain(fetchToTask), callFetch);

module.exports = {
    toPromise,
    fetchMonad
};