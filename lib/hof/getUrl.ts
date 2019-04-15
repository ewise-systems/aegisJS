// @ts-ignore
const { isString, replace } = require("lodash/fp");
// @ts-ignore
const { compose, curry, chain, pipe, map, nth, split, test } = require("ramda/es");
// @ts-ignore
const { matchCase } = require("../fpcore/matchCase");
// @ts-ignore
const { either, on, otherwise, id, fold, toNull } = require("../fpcore/pointfree");
// @ts-ignore
const { base64ToBuffer, parseJSON } = require("../fpcore/dataManip");
// @ts-ignore
const Maybe = require("../structs/Maybe");

const isEwiseUrl = test(/^https:\/\/pdv\.ewise\.com:\d{0,}\/?/);

const isJwt = () => false;

const getUrlFromJWT =
    pipe(
        split('.'),
        nth(1),
        base64ToBuffer,
        toString,
        parseJSON,
        either(toNull, id)
    )

const isUrlOrJwt =
    pipe(
        matchCase,
        on(isEwiseUrl, id),
        on(isJwt, getUrlFromJWT),
        otherwise(toNull),
        Maybe.of
    );

const doIfString = x => isString(x) ? Maybe.of(x) : Maybe.of(null);

const removeTrailingSlash = replace(/(\/)*$/, '');

// TODO: Improve this
// @ts-ignore
const makeUrl = curry((path, base) => {
    try {
        return removeTrailingSlash(base) + '/' + removeTrailingSlash(path);
    } catch (e) {
        return Maybe.of(null);
    }
});

// @ts-ignore
const getUrl = path => compose(map(makeUrl(path)), chain(isUrlOrJwt), doIfString);

module.exports = {
    isEwiseUrl,
    isJwt,
    getUrlFromJWT,
    isUrlOrJwt,
    doIfString,
    removeTrailingSlash,
    makeUrl,
    getUrl
};