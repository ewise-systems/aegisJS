// @ts-ignore
const { compose, chain, curry } = require("ramda/es");
// @ts-ignore
const taskFetch = require("../lib/hoc/taskFetch");
// @ts-ignore
const fetchToTask = require("../lib/hoc/fetchToTask");

// @ts-ignore
window.ew = window.ew || {};
// @ts-ignore
const ew = window.ew;

ew.init = curry((url, token) => {
    const task = compose(chain(fetchToTask), taskFetch)
    return {
        getAegisDetails: task(url, 'GET', null, null).fork,
        register: null,
        login: null,
        getInstitutions: null,
        startAggregation: null, // Provides phase polling, OTP, and ACA end callbacks
        stopAggregation: null,
        resumeAggregation: null
    };
});
