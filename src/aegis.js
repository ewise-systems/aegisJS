const uniqid = require("uniqid");
const { BehaviorSubject } = require("rxjs");
const { compose, curry } = require("ramda");
const { taskToObservable } = require("@ewise/aegisjs-core/frpcore/transforms");
const { requestToAegisWithToken } = require("@ewise/aegisjs-core/hof/requestToAegis");
const { kickstart$: initPollingStream } = require("@ewise/aegisjs-core/hos/pollingCore");
const { kickstartwithdelay$: initPollingStreamWithDelay } = require("@ewise/aegisjs-core/hos/pollingCore");
const { kickstartpoll$: initPolling } = require("@ewise/aegisjs-core/hos/pollingCore");
const { kickstartpollstoponerror$: initPollingStopOnError } = require("@ewise/aegisjs-core/hos/pollingCore");
const { fromPromised } = require('folktale/concurrency/task');
const promiseToTask = promise => fromPromised(() => promise);

const DEFAULT_REQUEST_TIMEOUT = 90000; //ms
const DEFAULT_RETY_LIMIT = 5;
const DEFAULT_DELAY_BEFORE_RETRY = 5000; //ms
const DEFAULT_POLLING_INTERVAL = 1000; //ms
const DEFAULT_AGGREGATE_WITH_TRANSACTIONS = true;

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
    DELETE_PROFILE: (profileId) => `/profiles/${profileId}`,

    // Add a new basic profile
    ADD_BASIC_PROFILE: "/profiles/basic",

    // Generic APIs to get and resume processes
    GET_PROCESS: (pid) => `/processes/${pid}`,
    RESUME_PROCESS: (pid) => `/processes/${pid}`,

    // Get accounts and transactions
    GET_ACCOUNTS: (accountId = "", profileId = "", accountType = "") => `/accounts/${accountId}?` + (profileId ? `&profileId=${profileId}` : "") + (accountType ? `&accountType=${accountType}` : ""),
    GET_TRANSACTIONS: (transactionId = "", startDate = "", endDate = "", profileId = "", accountId = "") => `/transactions/${transactionId}?` + (startDate ? `&startDate=${startDate}` : "") + (endDate ? `&endDate=${endDate}` : "") + (profileId ? `&profileId=${profileId}` : "") + (accountId ? `&accountId=${accountId}` : ""),

    // APIs for OTA
    GET_INSTITUTIONS: (instCode = "") => `/ota/institutions/${instCode}`,
    START_OTA: "/ota/process",
    QUERY_OTA: (pid, csrf = "") => `/ota/process/${pid}?challenge=${csrf}`,
    RESUME_OTA: (pid = "") => `/ota/process/${pid}`,
    STOP_OTA: (pid, csrf = "") => `/ota/process/${pid}?challenge=${csrf}`,

    // Update a profile
    UPDATE_PROFILE: (profileId) => `/profiles/${profileId}`,

    // Update a basic profile
    UPDATE_BASIC_PROFILE: (profileId) => `/profiles/${profileId}/basic`,

    // Check for updates
    CHECK_FOR_UPDATES: (updateSite) => `/public/updates/check?site=${updateSite}`,
    // Download updates
    DOWNLOAD_UPDATES: "/public/updates/download",
    // Download update process
    DOWNLOAD_UPDATE_PROCESS: "/public/updates/process",
    // Apply updates
    APPLY_UPDATES: "/public/updates/apply"
};

const createStream$ = (args = {}) => {
    const { retryLimit, retryDelay, start, check, resume, stop } = args;

    const subject$ = new BehaviorSubject({ processId: null });

    const TERMINAL_PDV_STATES = ["error", "partial", "stopped", "done"];
    const stopStreamCondition = arg => arg ? TERMINAL_PDV_STATES.indexOf(arg.status) === -1 : false;

    const initialStreamFactory = compose(taskToObservable, start);
    const pollingStreamFactory = compose(taskToObservable, check);
    const stream$ = initPollingStream(
        retryLimit,
        retryDelay,
        stopStreamCondition,
        initialStreamFactory,
        pollingStreamFactory
    );

    const unsafeStartExec$ = () => stream$.subscribe(
        data => subject$.next(data),
        err => subject$.error(err),
        () => subject$.complete(subject$.getValue())
    ) && subject$;
    const unsafeResumeExec$ = curry(resume)(() => subject$.getValue().processId);
    const unsafeStopExec$ = () => stop(subject$.getValue().processId);

    return {
        run: unsafeStartExec$,
        resume: unsafeResumeExec$,
        ...(stop ? {stop: unsafeStopExec$} : {})
    };
};

const createDownloadUpdateStreams$ = (args = {}) => {
    const TERMINAL_DOWNLOAD_STATES = ["FAILED", "READY"];
    const pollWhile = arg => arg ? TERMINAL_DOWNLOAD_STATES.indexOf(arg.status) === -1 : false;
    const { retryLimit, retryDelay, start, check, pollingInterval } = args;
    const subject$ = new BehaviorSubject({});
    const initialStreamFactory = compose(taskToObservable, start);
    const pollingStreamFactory = compose(taskToObservable, check);
    const stream$ = initPollingStreamWithDelay(
        retryLimit,
        retryDelay,
        pollWhile,
        initialStreamFactory,
        pollingStreamFactory,
        pollingInterval
    );
    
    const unsafeStartExec$ = () => stream$.subscribe(
        data => subject$.next(data),
        err => subject$.error(err),
        () => console.log(1, subject$.getValue()) || subject$.complete(subject$.getValue())
    ) && subject$;

    return {
        run: unsafeStartExec$
    };
};

const createPromisePollingStream$ = (args = {}) => {
    const { pollingInterval, retryLimit, retryDelay, start, pollWhile } = args;
    const initialStream$ = compose(taskToObservable, start);
    const createStream = initPolling(pollingInterval, retryLimit, retryDelay);
    const stream$ = createStream(pollWhile, initialStream$);
    return promiseToTask(stream$.toPromise())();
};

const createPromisePollingStreamStopOnError$ = (args = {}) => {
    const { pollingInterval, start, pollWhile } = args;
    const initialStream$ = compose(taskToObservable, start);
    const createStream = initPollingStopOnError(pollingInterval);
    const stream$ = createStream(pollWhile, initialStream$);
    return promiseToTask(stream$.toPromise())();
};

const aegis = (options = {}) => {
    const {
        jwt: defaultJwt,
        timeout: defaultTimeout = DEFAULT_REQUEST_TIMEOUT,
        retryLimit: defaultRetryLimit = DEFAULT_RETY_LIMIT,
        retryDelay: defaultRetryDelay = DEFAULT_DELAY_BEFORE_RETRY,
        ajaxTaskFn: defaultAjaxTaskFn = requestToAegisWithToken
    } = options;

    return {
        getDetails: (args = {}) => {
            const {
                jwtOrUrl = defaultJwt,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                null,
                null,
                timeout,
                PDV_PATHS.GET_DETAILS,
                jwtOrUrl
            );
        },

        hasStarted: (args = {}) => {
            const {
                jwtOrUrl = defaultJwt,
                pollingInterval = DEFAULT_POLLING_INTERVAL,
                timeout = 1000,
                retryLimit = -1,
                retryDelay = 1000,
                pollWhile = (response) => !response
            } = args;

            return createPromisePollingStream$({
                pollingInterval,
                retryLimit,
                retryDelay,
                pollWhile,
                start: () => requestToAegisWithToken(
                    HTTP_VERBS.GET,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.GET_DETAILS,
                    jwtOrUrl
                )
            });
        },

        hasStopped: (args = {}) => {
            const {
                jwtOrUrl = defaultJwt,
                pollingInterval = DEFAULT_POLLING_INTERVAL,
                timeout = 1000,
                pollWhile = ({aegis}) => aegis !== undefined
            } = args;

            return createPromisePollingStreamStopOnError$({
                pollingInterval,
                pollWhile,
                start: () => requestToAegisWithToken(
                    HTTP_VERBS.GET,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.GET_DETAILS,
                    jwtOrUrl
                )
            });
        },
        
        checkForUpdates: (args = {}) => {
            const {
                updateSite,
                jwtOrUrl = defaultJwt,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                null,
                null,
                timeout,
                PDV_PATHS.CHECK_FOR_UPDATES(updateSite),
                jwtOrUrl
            );
        },

        waitForUpdates: (args = {}) => {
            const {
                updateSite,
                jwtOrUrl = defaultJwt,
                pollingInterval = 1000,
                timeout = 5000,
                retryLimit = -1,
                retryDelay = 1000,
                pollWhile = (response) => !response
            } = args;
            return createPromisePollingStream$({
                pollingInterval,
                retryLimit,
                retryDelay,
                pollWhile,
                start: () => requestToAegisWithToken(
                    HTTP_VERBS.GET,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.CHECK_FOR_UPDATES(updateSite),
                    jwtOrUrl
                )
            });
        },

        downloadUpdates: (args = {}) => {
            const {
                pollingInterval = DEFAULT_POLLING_INTERVAL,
                jwtOrUrl = defaultJwt,
                timeout = defaultTimeout,
                retryLimit = defaultRetryLimit,
                retryDelay = defaultRetryDelay,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;

            return createDownloadUpdateStreams$({
                retryLimit,
                retryDelay,
                start: () => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.DOWNLOAD_UPDATES,
                    jwtOrUrl
                ),
                check: pid => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.DOWNLOAD_UPDATE_PROCESS,
                    jwtOrUrl
                ),
                pollingInterval
            });
        },

        applyUpdates: (args = {}) => {
            const {
                jwtOrUrl = defaultJwt,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                null,
                null,
                timeout,
                PDV_PATHS.APPLY_UPDATES,
                jwtOrUrl
            ); 
        },

        runBrowser: (args = {}) => {
            const {
                jwtOrUrl = defaultJwt,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                null,
                null,
                timeout,
                PDV_PATHS.RUN_BROWSER,
                jwtOrUrl
            );
        },
        
        getInstitutions: (args = {}) => {
            const {
                instCode,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                jwt,
                null,
                timeout,
                PDV_PATHS.GET_INSTITUTIONS(instCode)
            );
        },

        initializeOta: (args = {}) => {
            const {
                instCode,
                prompts,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                retryLimit = defaultRetryLimit,
                retryDelay = defaultRetryDelay,
                withTransactions: transactions = DEFAULT_AGGREGATE_WITH_TRANSACTIONS,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;

            const csrf = uniqid();
            const bodyCsrf = { code: instCode, prompts, challenge: csrf, transactions };

            return createStream$({
                retryLimit,
                retryDelay,
                start: () => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    bodyCsrf,
                    timeout,
                    PDV_PATHS.START_OTA
                ),
                check: pid => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.QUERY_OTA(pid, csrf)
                ),
                resume: (getPid, otp) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    { ...otp, challenge: csrf },
                    timeout,
                    PDV_PATHS.RESUME_OTA(getPid())
                ),
                stop: pid => ajaxTaskFn(
                    HTTP_VERBS.DELETE,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.STOP_OTA(pid, csrf)
                )
            });
        },

        addProfile: (args = {}) => {
            const {
                instCode,
                prompts,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                retryLimit = defaultRetryLimit,
                retryDelay = defaultRetryDelay,
                withTransactions: transactions = DEFAULT_AGGREGATE_WITH_TRANSACTIONS,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;

            const body = { code: instCode, prompts, transactions };

            return createStream$({
                retryLimit,
                retryDelay,
                start: () => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    body,
                    timeout,
                    PDV_PATHS.ADD_PROFILE
                ),
                check: pid => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    { code: instCode, ...prompts },
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                )
            });
        },

        addBasicProfile: (args = {}) => {
            const {
                instCode,
                prompts,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                retryLimit = defaultRetryLimit,
                retryDelay = defaultRetryDelay,
                withTransactions: transactions = DEFAULT_AGGREGATE_WITH_TRANSACTIONS,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;

            const body = { code: instCode, prompts, transactions };

            return createStream$({
                retryLimit,
                retryDelay,
                start: () => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    body,
                    timeout,
                    PDV_PATHS.ADD_BASIC_PROFILE
                ),
                check: pid => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    { code: instCode, ...prompts },
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                )
            });
        },

        deleteProfile: (args = {}) => {
            const {
                jwt = defaultJwt,
                profileId,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.DELETE,
                jwt,
                null,
                timeout,
                PDV_PATHS.DELETE_PROFILE(profileId)
            );
        },

        getProfiles: (args = {}) => {
            const {
                profileId = "",
                cred = false,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                jwt,
                null,
                timeout,
                PDV_PATHS.GET_PROFILES(profileId, cred)
            );
        },

        updateProfile: (args = {}) => {
            const {
                profileId,
                instCode,
                prompts,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                retryLimit = defaultRetryLimit,
                retryDelay = defaultRetryDelay,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;

            const body = instCode && prompts ?
                { code: instCode, prompts } :
                null;
            
            return createStream$({
                retryLimit,
                retryDelay,
                start: () => ajaxTaskFn(
                    HTTP_VERBS.PUT,
                    jwt,
                    body,
                    timeout,
                    PDV_PATHS.UPDATE_PROFILE(profileId)
                ),
                check: pid => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    prompts,
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                )
            });
        },

        updateBasicProfile: (args = {}) => {
            const {
                profileId,
                instCode,
                prompts,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                retryLimit = defaultRetryLimit,
                retryDelay = defaultRetryDelay,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;

            const body = instCode && prompts ?
                { code: instCode, prompts } :
                null;
            
            return createStream$({
                retryLimit,
                retryDelay,
                start: () => ajaxTaskFn(
                    HTTP_VERBS.PUT,
                    jwt,
                    body,
                    timeout,
                    PDV_PATHS.UPDATE_BASIC_PROFILE(profileId)
                ),
                check: pid => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    prompts,
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                )
            });
        },
        
        getAccounts: (args = {}) => {
            const {
                jwt = defaultJwt,
                accountId,
                profileId,
                accountType,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                jwt,
                null,
                timeout,
                PDV_PATHS.GET_ACCOUNTS(accountId, profileId, accountType)
            );
        },

        deleteAccount: (args = {}) => {
            const {
                jwt = defaultJwt,
                accountId,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.DELETE,
                jwt,
                null,
                timeout,
                PDV_PATHS.GET_ACCOUNTS(accountId)
            );
        },
        
        getTransactions: (args = {}) => {
            const {
                jwt = defaultJwt,
                transactionId,
                startDate,
                endDate,
                profileId,
                accountId,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                jwt,
                null,
                timeout,
                PDV_PATHS.GET_TRANSACTIONS(transactionId, startDate, endDate, profileId, accountId)
            );
        },

        deleteTransaction: (args = {}) => {
            const {
                jwt = defaultJwt,
                transactionId,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.DELETE,
                jwt,
                null,
                timeout,
                PDV_PATHS.GET_TRANSACTIONS(transactionId)
            );
        }
    };
};

module.exports = (options) =>
    Object.freeze(aegis(options));