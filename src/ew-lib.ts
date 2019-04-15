// @ts-ignore
const { compose, chain, curry } = require("ramda/es");
// @ts-ignore
const { callAjax } = require("../lib/hof/callAjax");
// @ts-ignore
const { fetchToTask } = require("../lib/hof/fetchToTask");
// @ts-ignore
const { taskToPromise } = require("../lib/fpcore/transforms");
// @ts-ignore
const { decorateClassInstance: decorate } = require("../lib/fpcore/pointfree");

// @ts-ignore
window.ew = window.ew || {};
// @ts-ignore
const ew = window.ew;

ew.init = curry((url, token) => {
    const toPromise = task => () => taskToPromise(task);
    const pipeline = compose(decorate('toPromise', toPromise), chain(fetchToTask), callAjax);
    return {
        public: {
            getAegisDetails: pipeline(url, 'GET', null, null),
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