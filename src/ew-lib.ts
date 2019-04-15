// @ts-ignore
const { curry } = require("ramda/es");
// @ts-ignore
const { fetchMonad } = require("../lib/hof/fetchMonad");

// @ts-ignore
window.ew = window.ew || {};
// @ts-ignore
const ew = window.ew;

ew.init = curry((url, token) => {
    return {
        public: {
            getAegisDetails: fetchMonad(url, 'GET', null, null),
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