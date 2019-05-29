const { from } = require("rxjs");
const { requestToAegis } = require("../hof/requestToAegis");

// toObservable :: string -> string -> string -> string -> Stream x
const toObservable = (method, jwt, body, path) => () =>
    from(
        requestToAegis(method, jwt, body, path)(jwt)
        .run()
        .promise()
    );

module.exports = {
    toObservable
};