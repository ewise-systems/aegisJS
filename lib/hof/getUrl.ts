// @ts-ignore
const { isString, replace } = require("lodash/fp");
// @ts-ignore
const { compose, curry, chain, pipe, map, test } = require("ramda/es");
// @ts-ignore
const { matchCase } = require("../fpcore/matchCase");
// @ts-ignore
const { on, otherwise, id } = require("../fpcore/pointfree");
// @ts-ignore
const { getUrlFromJWT } = require("../fpcore/dataManip");
// @ts-ignore
const Maybe = require("../structs/Maybe");

const isEwiseUrl = test(/^https:\/\/pdv\.ewise\.com:\d{0,}\/?/);

const isUrlOrJwt =
    pipe(
        matchCase,
        on(isEwiseUrl, id),
        otherwise(getUrlFromJWT),
        Maybe.of
    );

const doIfString = x => isString(x) ? Maybe.of(x) : Maybe.of(null);

const removeTrailingSlash = replace(/(\/)*$/g, '');

const removeLeadingAndTrailingSlash = replace(/((^(\/)*)|((\/)*$))/g, '');

// TODO: Improve this
// @ts-ignore
const makeUrl = curry((path, base) => {
    try {
        return removeTrailingSlash(base.trim()) + '/' + removeLeadingAndTrailingSlash(path.trim());
    } catch (e) {
        return Maybe.of(null);
    }
});

// @ts-ignore
const getUrl = path => compose(map(makeUrl(path)), chain(isUrlOrJwt), doIfString);

module.exports = {
    isEwiseUrl,
    getUrlFromJWT,
    isUrlOrJwt,
    doIfString,
    removeTrailingSlash,
    makeUrl,
    getUrl
};