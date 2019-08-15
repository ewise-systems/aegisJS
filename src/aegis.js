const uniqid = require("uniqid");
const { not } = require("ramda");
const { isNotNil } = require("@ewise/aegisjs-core/fpcore/pointfree");
const { addDelay } = require("@ewise/aegisjs-core/frpcore/pointfree");
const { requestToAegisWithToken } = require("@ewise/aegisjs-core/hof/requestToAegis");
const {
    createRecursivePollStream,
    createTaskFromIntervalRetryPollStream,
    createTaskFromIntervalPollStream
} = require("@ewise/aegisjs-core");
const {
    DEFAULT_REQUEST_TIMEOUT,
    FIVE_SECOND_REQUEST_TIMEOUT,
    ONE_SECOND_REQUEST_TIMEOUT,
    DEFAULT_RETY_LIMIT,
    DEFAULT_DELAY_BEFORE_RETRY,
    RAPID_DELAY_BEFORE_RETRY,
    DEFAULT_POLLING_INTERVAL,
    DEFAULT_AGGREGATE_WITH_TRANSACTIONS,
    POSITIVE_INFINITY
} = require("@ewise/aegisjs-core/constants/standardValues");
const HTTP_VERBS = require("@ewise/aegisjs-core/constants/httpVerbs");

const createRecursivePDVPollStream = createRecursivePollStream("error", "partial", "stopped", "done");
const createRecursiveDownloadPollStream = createRecursivePollStream("FAILED", "READY");

const PDV_PATHS = {
    // APIs with no auth
    GET_DETAILS: "/",
    RUN_BROWSER: "/public/browser",

    // Auth APIs
    REGISTER_USER: (pin = "1234567890") => `/register?pin=${pin}`,
    LOGIN_USER: "/login",

    // Add a new profile
    ADD_PROFILE: "/profiles",
    GET_PROFILES: (profileId = "", cred = false) => `/profiles/${profileId}${cred ? "/credential" : ""}`,
    DELETE_PROFILE: (profileId) => `/profiles/${profileId}`,

    // Get institutions
    GET_INSTITUTIONS: (instCode = "") => `/institutions/${instCode}`,

    // Open a browser and login
    LOGIN_AND_ADD_PROFILE: "/profiles/login",
    LOGIN_PROFILE: (profileId) => `/profiles/${profileId}/login`,

    // Add a new basic profile
    ADD_BASIC_PROFILE: "/profiles/basic",

    // Generic APIs to get and resume processes
    GET_PROCESS: (pid) => `/processes/${pid}`,
    RESUME_PROCESS: (pid) => `/processes/${pid}`,
    STOP_PROCESS: (pid) => `/ota/process/${pid}`,

    // Get accounts and transactions
    GET_ACCOUNTS: (accountId = "", profileId = "", accountType = "") => `/accounts/${accountId}?` + (profileId ? `&profileId=${profileId}` : "") + (accountType ? `&accountType=${accountType}` : ""),
    GET_TRANSACTIONS: (transactionId = "", startDate = "", endDate = "", profileId = "", accountId = "") => `/transactions/${transactionId}?` + (startDate ? `&startDate=${startDate}` : "") + (endDate ? `&endDate=${endDate}` : "") + (profileId ? `&profileId=${profileId}` : "") + (accountId ? `&accountId=${accountId}` : ""),

    // APIs for OTA
    GET_INSTITUTIONS_OTA: (instCode = "") => `/ota/institutions/${instCode}`,
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

        registerUser: (args = {}) => {
            const {
                pin,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.POST,
                jwt,
                null,
                timeout,
                PDV_PATHS.REGISTER_USER(pin)
            );
        },

        loginUser: (args = {}) => {
            const {
                url,
                data,
                timeout = defaultTimeout,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return ajaxTaskFn(
                HTTP_VERBS.POST,
                null,
                data,
                timeout,
                PDV_PATHS.LOGIN_USER,
                url
            );
        },

        hasStarted: (args = {}) => {
            const {
                jwtOrUrl = defaultJwt,
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
                timeout = ONE_SECOND_REQUEST_TIMEOUT,
                retryLimit = POSITIVE_INFINITY,
                retryDelay = RAPID_DELAY_BEFORE_RETRY,
                pollWhile: pred = not,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return createTaskFromIntervalRetryPollStream(
                pollInterval,
                retryLimit,
                retryDelay,
                pred,
                () => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.GET_DETAILS,
                    jwtOrUrl
                )
            );
        },

        hasStopped: (args = {}) => {
            const {
                jwtOrUrl = defaultJwt,
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
                timeout = ONE_SECOND_REQUEST_TIMEOUT,
                pollWhile: pred = isNotNil,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return createTaskFromIntervalPollStream(
                pollInterval,
                pred,
                () => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.GET_DETAILS,
                    jwtOrUrl
                )
            );
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
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
                timeout = FIVE_SECOND_REQUEST_TIMEOUT,
                retryLimit = POSITIVE_INFINITY,
                retryDelay = RAPID_DELAY_BEFORE_RETRY,
                pollWhile: pred = not,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return createTaskFromIntervalRetryPollStream(
                pollInterval,
                retryLimit,
                retryDelay,
                pred,
                () => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.CHECK_FOR_UPDATES(updateSite),
                    jwtOrUrl
                )
            );
        },

        downloadUpdates: (args = {}) => {
            const {
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
                jwtOrUrl = defaultJwt,
                timeout = defaultTimeout,
                retryLimit = defaultRetryLimit,
                retryDelay = defaultRetryDelay,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;
            return createRecursiveDownloadPollStream({
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
                afterCheck: addDelay(pollInterval),
                check: () => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.DOWNLOAD_UPDATE_PROCESS,
                    jwtOrUrl
                ),
                stop: pid => ajaxTaskFn(
                    HTTP_VERBS.DELETE,
                    null,
                    null,
                    timeout,
                    PDV_PATHS.STOP_PROCESS(pid)
                )
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

        getInstitutionsOta: (args = {}) => {
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
                PDV_PATHS.GET_INSTITUTIONS_OTA(instCode)
            );
        },

        initializeOta: (args = {}) => {
            const {
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
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

            return createRecursivePDVPollStream({
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
                afterCheck: addDelay(pollInterval),
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
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
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

            return createRecursivePDVPollStream({
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
                afterCheck: addDelay(pollInterval),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    { ...prompts },
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                ),
                stop: pid => ajaxTaskFn(
                    HTTP_VERBS.DELETE,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.STOP_PROCESS(pid)
                )
            });
        },

        addProfileAndLogin: (args = {}) => {
            const {
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
                instCode,
                prompts,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                retryLimit = defaultRetryLimit,
                retryDelay = defaultRetryDelay,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;

            const body = { code: instCode, prompts };

            return createRecursivePDVPollStream({
                retryLimit,
                retryDelay,
                start: () => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    body,
                    timeout,
                    PDV_PATHS.LOGIN_AND_ADD_PROFILE
                ),
                check: pid => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                afterCheck: addDelay(pollInterval),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    { ...prompts },
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                ),
                stop: pid => ajaxTaskFn(
                    HTTP_VERBS.DELETE,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.STOP_PROCESS(pid)
                )
            });
        },

        loginProfile: (args = {}) => {
            const {
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
                profileId,
                jwt = defaultJwt,
                timeout = defaultTimeout,
                retryLimit = defaultRetryLimit,
                retryDelay = defaultRetryDelay,
                ajaxTaskFn = defaultAjaxTaskFn
            } = args;

            return createRecursivePDVPollStream({
                retryLimit,
                retryDelay,
                start: () => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.LOGIN_PROFILE(profileId)
                ),
                check: pid => ajaxTaskFn(
                    HTTP_VERBS.GET,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.GET_PROCESS(pid)
                ),
                afterCheck: addDelay(pollInterval),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    { ...prompts },
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                ),
                stop: pid => ajaxTaskFn(
                    HTTP_VERBS.DELETE,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.STOP_PROCESS(pid)
                )
            });
        },

        addBasicProfile: (args = {}) => {
            const {
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
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

            return createRecursivePDVPollStream({
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
                afterCheck: addDelay(pollInterval),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    { ...prompts },
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                ),
                stop: pid => ajaxTaskFn(
                    HTTP_VERBS.DELETE,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.STOP_PROCESS(pid)
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
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
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
            
            return createRecursivePDVPollStream({
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
                afterCheck: addDelay(pollInterval),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    prompts,
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                ),
                stop: pid => ajaxTaskFn(
                    HTTP_VERBS.DELETE,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.STOP_PROCESS(pid)
                )
            });
        },

        updateBasicProfile: (args = {}) => {
            const {
                pollingInterval: pollInterval = DEFAULT_POLLING_INTERVAL,
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
            
            return createRecursivePDVPollStream({
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
                afterCheck: addDelay(pollInterval),
                resume: (getPid, prompts) => ajaxTaskFn(
                    HTTP_VERBS.POST,
                    jwt,
                    prompts,
                    timeout,
                    PDV_PATHS.RESUME_PROCESS(getPid())
                ),
                stop: pid => ajaxTaskFn(
                    HTTP_VERBS.DELETE,
                    jwt,
                    null,
                    timeout,
                    PDV_PATHS.STOP_PROCESS(pid)
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
            const queryParams = [accountId, profileId, accountType];
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                jwt,
                null,
                timeout,
                PDV_PATHS.GET_ACCOUNTS(...queryParams)
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
            const queryParams = [transactionId, startDate, endDate, profileId, accountId];
            return ajaxTaskFn(
                HTTP_VERBS.GET,
                jwt,
                null,
                timeout,
                PDV_PATHS.GET_TRANSACTIONS(...queryParams)
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