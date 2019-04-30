const uniqid = require("uniqid");
const { curry } = require("ramda");
const { BehaviorSubject } = require("rxjs");
const { requestToAegis, requestToAegisWithToken } = require("../lib/hof/requestToAegis");
const { scrapeFromPDV$ } = require("../lib/hos/scrapeFromPDV");

const aegis = {
    getDetails: requestToAegis("GET", null, null, "/"),
    runBrowser: requestToAegis("GET", null, null, "/public/browser"),
    initializeOta: jwt => ({
        getInstitutions: (instCode = "") =>
            requestToAegisWithToken({
                method: "GET",
                jwt,
                body: null,
                path: `/ota/institutions/${instCode}`,
                tokenOrUrl: jwt
            }),
        start: curry((instCode, prompts) => {
            const csrf = uniqid();
            const stream$ = new BehaviorSubject({});
            const bodyCsrf = { code: instCode, prompts, challenge: csrf };
            scrapeFromPDV$(jwt, csrf, bodyCsrf).subscribe(stream$);
            return {
                stream$,
                resume: otp =>
                    requestToAegisWithToken({
                        method: "POST",
                        jwt,
                        body: { ...otp, challenge: csrf },
                        path: `/ota/process/${stream$.value.processId}`,
                        tokenOrUrl: jwt
                    }),
                stop: () =>
                    requestToAegisWithToken({
                        method: "DELETE",
                        jwt,
                        body: null,
                        path: `ota/process/${stream$.value.processId}?challenge=${csrf}`, 
                        tokenOrUrl: jwt
                    })
            };
        }),
    })
};

module.exports = () =>
    Object.freeze(aegis);