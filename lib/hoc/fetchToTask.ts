// @ts-ignore
const { compose } = require("ramda/es");
// @ts-ignore
const { promiseToTask } = require("../fpcore/transforms")

const getFetchPromise = x => x.json();

// @ts-ignore
const fetchToTask = compose(promiseToTask, getFetchPromise);

// @ts-ignore
module.exports = {
    getFetchPromise,
    fetchToTask
};