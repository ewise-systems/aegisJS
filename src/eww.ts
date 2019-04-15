// @ts-ignore
const { curry } = require("ramda/es");
// @ts-ignore
const { requestToAegis } = require("../lib/hof/requestToAegis");

// @ts-ignore
const eww = {
    getAegisDetails: requestToAegis('GET', null, null, '/'),
    runBrowser: requestToAegis('GET', null, null, '/public/browser'),
    register: pin => null,
    login: pin => null,
    initOTA: curry(jwt => {
        // const [url, user] = decodeToken(jwt);
        return {
            getInstitutions: null,
            startAggregation: null, // Provides phase polling, OTP, and ACA end callbacks
            stopAggregation: null,
            resumeAggregation: null
        }
    })
};

// @ts-ignore
window.ew = window.ew || {};
// @ts-ignore
window.ew = { ...window.ew, ...eww };