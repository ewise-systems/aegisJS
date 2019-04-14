// @ts-ignore
const { compose, chain, curry } = require("ramda/es");
// @ts-ignore
const { taskFetch } = require("../lib/hoc/taskFetch");
// @ts-ignore
const { fetchToTask } = require("../lib/hoc/fetchToTask");

// @ts-ignore
window.ew = window.ew || {};
// @ts-ignore
const ew = window.ew;

ew.init = curry((url, token) => {
    const task = compose(chain(fetchToTask), taskFetch)
    return {
        public: {
            getAegisDetails: task(url, 'GET', null, null).fork,
            runBrowser: null
        },
        user: {
            register: null,
            login: null
        },
        ota: {
            getInstitutions: null,
            startAggregation: null, // Provides phase polling, OTP, and ACA end callbacks
            stopAggregation: null,
            resumeAggregation: null
        }
    };
});
