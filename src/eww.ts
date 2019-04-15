// @ts-ignore
const { requestToAegis } = require("../lib/hof/requestToAegis");

// @ts-ignore
const eww = {
    getAegisDetails: requestToAegis('GET', null, null, '/'),
    runBrowser: requestToAegis('GET', null, null, '/public/browser'),
    register: pin => null,
    login: pin => null,
    initOTA: jwt => ({
        getInstitutions: (instCode = '') =>
            requestToAegis('GET', jwt, null, `/ota/institutions/${instCode}`)(jwt),
        startAggregation: () => { // Provides phase polling, error, OTP, and ACA end callbacks

        },
        stopAggregation: null,
        resumeAggregation: null
    })
};

// @ts-ignore
window.ew = window.ew || {};
// @ts-ignore
window.ew = { ...window.ew, ...eww };