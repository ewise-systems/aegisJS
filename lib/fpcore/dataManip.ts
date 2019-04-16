// @ts-ignore
const { isString } = require("lodash/fp");
// @ts-ignore
const { compose, pipe, toString: toStr, split, nth, prop } = require("ramda/es");
// @ts-ignore
const { Left, Right } = require("../structs/Either");
// @ts-ignore
const { either, id, toNull, on, otherwise } = require("../fpcore/pointfree");
// @ts-ignore
const { matchCase } = require("./matchCase");

// @ts-ignore
const base64ToBuffer = x => Buffer.from(x, 'base64');

// @ts-ignore
const parseJSON = x => {
    try {
        return new Right(JSON.parse(x));
    } catch(e) {
        return new Left(e);
    }
};

// @ts-ignore
const stringToBuffer =
    pipe(
        matchCase,
        on(isString, base64ToBuffer),
        otherwise(toNull)
    );
    

// @ts-ignore
const getBodyFromJWT =
    pipe(
        toStr,
        split('.'),
        nth(1),
        stringToBuffer,
        toStr,
        parseJSON,
        either(toNull, id)
    );

// @ts-ignore
const getUrlFromJWT = compose(prop('aegis'), getBodyFromJWT);

module.exports = {
    base64ToBuffer,
    parseJSON,
    getBodyFromJWT,
    getUrlFromJWT
};