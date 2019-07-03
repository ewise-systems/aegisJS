const uniqid = require("uniqid");
const { BehaviorSubject } = require("rxjs");
const { compose, curry } = require("ramda");
const { toObservable } = require("@ewise/aegisjs-core/frpcore/transforms");
const { requestToAegisWithToken } = require("@ewise/aegisjs-core/hof/requestToAegis");
const { kickstart$ } = require("@ewise/aegisjs-core/hos/pollingCore");

const HTTP_VERBS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE"
};

const PDV_PATHS = {
    // APIs with no auth
    GET_DETAILS: "/",
    RUN_BROWSER: "/public/browser",

    // Add a new profile
    ADD_PROFILE: "/profiles",
    GET_PROFILES: (profileId = "", cred = false) => `/profiles/${profileId}${cred ? "/credential" : ""}`,

    // Add a new basic profile
    ADD_BASIC_PROFILE: "/profiles/basic",

    // Generic APIs to get and resume processes
    GET_PROCESS: (pid) => `/processes/${pid}`,
    RESUME_PROCESS: (pid) => `/processes/${pid}`,

    // Get accounts and transactions
    GET_ACCOUNTS: "/accounts",
    GET_TRANSACTIONS: "/transactions",

    // APIs for OTA
    GET_INSTITUTIONS: (instCode = "") => `/ota/institutions/${instCode}`,
    START_OTA: "/ota/process",
    QUERY_OTA: (pid, csrf = "") => `/ota/process/${pid}?challenge=${csrf}`,
    RESUME_OTA: (pid = "") => `/ota/process/${pid}`,
    STOP_OTA: (pid, csrf = "") => `/ota/process/${pid}?challenge=${csrf}`,

    // Update a profile
    UPDATE_PROFILE: (profileId) => `/profiles/${profileId}`,

    // Update a basic profile
    UPDATE_BASIC_PROFILE: (profileId) => `/profiles/${profileId}/basic`
};

const createStream$ = (args = {}) => {
    const { start, check, resume, stop } = args;

    const subject$ = new BehaviorSubject({ processId: null });

    const TERMINAL_PDV_STATES = ["error", "partial", "stopped", "done"];
    const stopStreamCondition = ({ status }) => TERMINAL_PDV_STATES.indexOf(status) === -1;

    const initialStream$ = compose(toObservable, start);
    const pollingStream$ = compose(toObservable, check);
    const stream$ = kickstart$(stopStreamCondition, initialStream$, pollingStream$);

    const unsafeStartExec$ = () => stream$.subscribe(
        data => subject$.next(data),
        err => subject$.error(err),
        () => subject$.complete()
    ) && subject$;

    const unsafeResumeExec$ = curry(resume)(() => subject$.getValue().processId);

    const unsafeStopExec$ = () => stop(subject$.getValue().processId);

    return {
        run: unsafeStartExec$,
        resume: unsafeResumeExec$,
        ...(stop ? {stop: unsafeStopExec$} : {})
    };
};

const aegis = (options = {}) => {
    const { jwt: defaultJwt } = options;

    return {
        getDetails: (args = {}) => {
            const { jwtOrUrl = defaultJwt } = args;
            return requestToAegisWithToken(
                HTTP_VERBS.GET,
                null,
                null,
                PDV_PATHS.GET_DETAILS,
                jwtOrUrl
            );
        },

        runBrowser: (args = {}) => {
            const { jwtOrUrl = defaultJwt } = args;
            return requestToAegisWithToken(
                HTTP_VERBS.GET,
                null,
                null,
                PDV_PATHS.RUN_BROWSER,
                jwtOrUrl
            );
        },
        
        getInstitutions: (args = {}) => {
            const {
                instCode,
                jwt = defaultJwt
            } = args;
            return requestToAegisWithToken(
                HTTP_VERBS.GET,
                jwt,
                null,
                PDV_PATHS.GET_INSTITUTIONS(instCode)
            );
        },

        initializeOta: (args = {}) => {
            const {
                instCode,
                prompts,
                jwt = defaultJwt
            } = args;

            const csrf = uniqid();
            const bodyCsrf = { code: instCode, prompts, challenge: csrf };

            return createStream$({
                start: () => requestToAegisWithToken(
                    HTTP_VERBS.POST,
                    jwt,
                    bodyCsrf,
                    PDV_PATHS.START_OTA
                ),
                check: pid => requestToAegisWithToken(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    PDV_PATHS.QUERY_OTA(pid, csrf)
                ),
                resume: (getPid, otp) => requestToAegisWithToken(
                    HTTP_VERBS.POST,
                    jwt,
                    { ...otp, challenge: csrf },
                    PDV_PATHS.RESUME_OTA(getPid())
                ),
                stop: pid => requestToAegisWithToken(
                    HTTP_VERBS.DELETE,
                    jwt,
                    null,
                    PDV_PATHS.STOP_OTA(pid, csrf)
                )
            });
        },

        addProfile: (args = {}) => {
            const {
                instCode,
                prompts,
                jwt = defaultJwt
            } = args;

            const body = { code: instCode, prompts };

            return createStream$({
                start: () => requestToAegisWithToken(
                    HTTP_VERBS.POST,
                    jwt,
                    body,
                    PDV_PATHS.ADD_PROFILE
                ),
                check: pid => requestToAegisWithToken(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                resume: (getPid, prompts) => requestToAegisWithToken(
                    HTTP_VERBS.POST,
                    jwt,
                    { code: instCode, ...prompts },
                    PDV_PATHS.RESUME_PROCESS(getPid())
                )
            });
        },

        addBasicProfile: (args = {}) => {
            const {
                instCode,
                prompts,
                jwt = defaultJwt
            } = args;

            const body = { code: instCode, prompts };

            return createStream$({
                start: () => requestToAegisWithToken(
                    HTTP_VERBS.POST,
                    jwt,
                    body,
                    PDV_PATHS.ADD_BASIC_PROFILE
                ),
                check: pid => requestToAegisWithToken(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                resume: (getPid, prompts) => requestToAegisWithToken(
                    HTTP_VERBS.POST,
                    jwt,
                    { code: instCode, ...prompts },
                    PDV_PATHS.RESUME_PROCESS(getPid())
                )
            });
        },

        getProfiles: (args = {}) => {
            const {
                profileId = "",
                cred = false,
                jwt = defaultJwt
            } = args;
            return requestToAegisWithToken(
                HTTP_VERBS.GET,
                jwt,
                null,
                PDV_PATHS.GET_PROFILES(profileId, cred)
            );
        },

        updateProfile: (args = {}) => {
            const {
                profileId,
                instCode,
                prompts,
                jwt = defaultJwt
            } = args;

            const body = instCode && prompts ?
                { code: instCode, prompts } :
                null;
            
            return createStream$({
                start: () => requestToAegisWithToken(
                    HTTP_VERBS.PUT,
                    jwt,
                    body,
                    PDV_PATHS.UPDATE_PROFILE(profileId)
                ),
                check: pid => requestToAegisWithToken(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                resume: (getPid, prompts) => requestToAegisWithToken(
                    HTTP_VERBS.POST,
                    jwt,
                    prompts,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                )
            });
        },

        updateBasicProfile: (args = {}) => {
            const {
                profileId,
                instCode,
                prompts,
                jwt = defaultJwt
            } = args;

            const body = instCode && prompts ?
                { code: instCode, prompts } :
                null;
            
            return createStream$({
                start: () => requestToAegisWithToken(
                    HTTP_VERBS.PUT,
                    jwt,
                    body,
                    PDV_PATHS.UPDATE_BASIC_PROFILE(profileId)
                ),
                check: pid => requestToAegisWithToken(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                resume: (getPid, prompts) => requestToAegisWithToken(
                    HTTP_VERBS.POST,
                    jwt,
                    prompts,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                )
            });
        },
        
        getAccounts: (args = {}) => {
            const { jwt = defaultJwt } = args;
            return requestToAegisWithToken(
                HTTP_VERBS.GET,
                jwt,
                null,
                PDV_PATHS.GET_ACCOUNTS
            );
        },
        
        getTransactions: (args = {}) => {
            const { jwt = defaultJwt } = args;
            return requestToAegisWithToken(
                HTTP_VERBS.GET,
                jwt,
                null,
                PDV_PATHS.GET_TRANSACTIONS
            );
        }
    };
};

module.exports = (options) =>
    Object.freeze(aegis(options));