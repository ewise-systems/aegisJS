const uniqid = require("uniqid");
// @ts-ignore
const { requestToAegis } = require("../lib/hof/requestToAegis");
// @ts-ignore
const Stream = require("../lib/structs/Stream");
// @ts-ignore
const Task = require("../lib/structs/Task");
// @ts-ignore
const { curry } = require("ramda/es");

const someHOF = curry((jwt, csrf, body) => {
    return new Stream(
        phase => phase === "DONE",
        (pred, next, error, done) => {
            const init = requestToAegis("POST", jwt, body, "/ota/process")(jwt);
            const timer = fetchMonad => setTimeout(() => {
                const newFetchMonad = fetchMonad
                .chain(data => {
                    const { processId: pid, status, phase } = data;
                    if(pred(phase)) {
                        // end loop
                        done(data)
                        return Task.of(null);
                    } else if(status === "userInput") {
                        const otpChain = next(data);
                        const newBody = { ...otpChain, challenge: csrf };
                        return requestToAegis("POST", jwt, newBody, `/ota/process/${pid}`)(jwt)
                    } else {
                        next(data);
                        const yyy = requestToAegis("GET", jwt, null, `/ota/process/${pid}?challenge=${csrf}`)(jwt);
                        console.log('yyyy', yyy);
                        return yyy;
                    }
                })
                newFetchMonad.fork(error, data => {
                    data === null ? null : timer(new Task((_, result) => result(data)));
                })
            }, 500);
            timer(init);
        }
    );
})

// @ts-ignore
const aegis = {
    getDetails: requestToAegis('GET', null, null, '/'),
    runBrowser: requestToAegis('GET', null, null, '/public/browser'),
    register: pin => null,
    login: pin => null,
    ota: jwt => ({
        getInstitutions: (instCode = '') =>
            requestToAegis('GET', jwt, null, `/ota/institutions/${instCode}`)(jwt),
        start: body => { // Provides phase polling, error, OTP, and ACA end callbacks
            // POST call to https://pdv.ewise.com:8443/ota/process
            const csrf = uniqid.time();
            return someHOF(jwt, csrf, {...body, challenge: csrf});
            // requestToAegis('POST', jwt, body, '/ota/process')(jwt)
            // .map(({processId, type, status, profileId}) => {
            //     someHOF('POST', jwt, body, `/ota/process/${processId}?challenge=${csrf}`)
            // })
        },
        stop: null,
        resume: null
    })
};

// @ts-ignore
window.aegis = window.aegis || {};
// @ts-ignore
window.aegis = { ...window.ew, ...aegis };