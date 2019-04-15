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
        getAegisDetails: fetchMonad(url, 'GET', null, null),
        runBrowser: null,
        register: null,
        login: null,
        getInstitutions: null,
        startAggregation: null, // Provides phase polling, OTP, and ACA end callbacks
        stopAggregation: null,
        resumeAggregation: null
    };
});