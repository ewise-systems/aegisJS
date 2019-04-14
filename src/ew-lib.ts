// @ts-ignore
const { compose, chain, curry } = require("ramda/es");
// @ts-ignore
const { callAjax } = require("../lib/hof/callAjax");
// @ts-ignore
const { fetchToTask } = require("../lib/hof/fetchToTask");

// @ts-ignore
window.ew = window.ew || {};
// @ts-ignore
const ew = window.ew;

ew.init = curry((url, token) => {
    const task = compose(chain(fetchToTask), callAjax);
    return {
        public: {
            getAegisDetails: task(url, 'GET', null, null),
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