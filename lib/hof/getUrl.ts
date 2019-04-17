import { compose, curry, chain, pipe, map, replace, test } from "ramda";
import { matchCase } from "../fpcore/matchCase";
import { on, otherwise, id } from "../fpcore/pointfree";
import { getUrlFromJWT, isString } from "../fpcore/dataManip";
import { Maybe } from "../structs/Maybe";
// const { isString } = require("lodash/fp");

const isEwiseUrl = test(/^https:\/\/pdv\.ewise\.com:\d{0,}\/?/);

const isUrlOrJwt =
    pipe(
        matchCase,
        on(isEwiseUrl, id),
        otherwise(getUrlFromJWT),
        Maybe.of
    );

const doIfString = (x: string) => isString(x) ? Maybe.of(x) : Maybe.of(null);

const removeTrailingSlash = replace(/(\/)*$/g, '');

const removeLeadingAndTrailingSlash = replace(/((^(\/)*)|((\/)*$))/g, '');

// TODO: Improve this
const makeUrl = curry((path, base) => {
    try {
        return removeTrailingSlash(base.trim()) + '/' + removeLeadingAndTrailingSlash(path.trim());
    } catch (e) {
        return Maybe.of(null);
    }
});

// @ts-ignore
const getUrl = (path: string) => compose(map(makeUrl(path)), chain(isUrlOrJwt), doIfString);

export {
    isEwiseUrl,
    getUrlFromJWT,
    isUrlOrJwt,
    doIfString,
    removeTrailingSlash,
    makeUrl,
    getUrl
};