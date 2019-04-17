import { requestToAegis } from "../lib/hof/requestToAegis";
import { Stream } from "../lib/structs/Stream";
import { Task } from "../lib/structs/Task";
import { curry } from "ramda";
const uniqid = require("uniqid");

const someHOF = curry((jwt, csrf, body) => {
    return new Stream(
        (phase: string) => phase === "DONE",
        (pred: any, next: any, error: any, done: any) => {
            const init = requestToAegis("POST", jwt, body, "/ota/process")(jwt);
            const timer = (fetchMonad: any) => setTimeout(() => {
                const newFetchMonad = fetchMonad
                .chain((data: any) => {
                    const { processId: pid, status, phase } = data;
                    if(pred(phase)) {
                        done(data);
                        return Task.of(null);
                    } else if(status === "userInput") {
                        const otpChain = next(data);
                        const newBody = { ...otpChain, challenge: csrf };
                        return requestToAegis("POST", jwt, newBody, `/ota/process/${pid}`)(jwt)
                    } else {
                        next(data);
                        return requestToAegis("GET", jwt, null, `/ota/process/${pid}?challenge=${csrf}`)(jwt);
                    }
                })
                newFetchMonad.fork(error, (data: any) => {
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
    register: null,
    login: null,
    ota: (jwt: string) => ({
        getInstitutions: (instCode = '') =>
            requestToAegis('GET', jwt, null, `/ota/institutions/${instCode}`)(jwt),
        start: (body: any) => {
            const csrf = uniqid.time();
            return someHOF(jwt, csrf, {...body, challenge: csrf});
        },
        stop: null,
        resume: null
    })
};

// @ts-ignore
window.aegis = window.aegis || {};
// @ts-ignore
window.aegis = { ...window.ew, ...aegis };

export {
    aegis
}