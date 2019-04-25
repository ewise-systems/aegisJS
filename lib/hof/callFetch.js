const axios = require("axios");
const Maybe = require("folktale/maybe");
const { compose, concat, curry, toString, prop, replace } = require("ramda");
const { task } = require("folktale/concurrency/task");
const { liftA3m } = require("../fpcore/liftA");
const { addProp } = require("../fpcore/pointfree");

const sendRequest = curry((url, method, token, data) =>
    task(({reject, resolve}) =>
        axios({
            url, ...method, headers: { ...token },  ...data
        })
        .then(compose(resolve, prop('data')))
        .catch(compose(reject, prop('data'), prop('response')))
    )
);

const addMethod = curry((method, obj) =>
    Maybe
    .Just(method)
    .map(addProp(obj, 'method'))
    .getOrElse({})
);

const addAuthHeader = curry((token, obj) =>
    Maybe
    .Just(token)
    .map(toString)
    .map(replace(/\"/g, ""))
    .map(concat('Bearer '))
    .map(addProp(obj, 'Authorization'))
    .map(x => ({ ...x, "Content-Type": "application/json" }))
    .getOrElse({})
);

const addData = curry((data, obj) =>
    Maybe
    .Just(data)
    .map(JSON.stringify)
    .map(addProp(obj, 'data'))
    .getOrElse({})
);

const callFetch = curry((method, token, data, url) =>
    liftA3m(
        sendRequest(url),
        addMethod(method),
        addAuthHeader(token),
        addData(data),
        Maybe.Just({})
    )
    .getOrElse(null)
);

module.exports = {
    sendRequest,
    addMethod,
    addAuthHeader,
    addData,
    callFetch
};