const uniqid = require("uniqid");
const root = require("window-or-global");
const { BehaviorSubject } = require("rxjs");
const { requestToAegis, requestToAegisWithToken } = require("../lib/hof/requestToAegis");
const { scrapeFromPDV } = require("../lib/hos/scrapeFromPDV");

const aegis = {
    getDetails: requestToAegis("GET", null, null, "/"),
    runBrowser: requestToAegis("GET", null, null, "/public/browser"),
    register: null,
    login: null,
    initializeOta: jwt => ({
        getInstitutions: (instCode = "") =>
            requestToAegisWithToken({
                method: "GET",
                jwt,
                body: null,
                path: `/ota/institutions/${instCode}`,
                tokenOrUrl: jwt
            }),
        start: body => {
            const csrf = uniqid();
            const stream$ = new BehaviorSubject({});
            const bodyCsrf = { ...body, challenge: csrf };
            scrapeFromPDV(jwt, csrf, bodyCsrf).subscribe(stream$);
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
            }
        },
    })
};

// Make aegis globally available
root.aegis = root.aegis || {};
root.aegis = { ...root.aegis, ...aegis };