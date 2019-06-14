const url = require("url");
const Ajv = require("ajv");
const Result = require("folktale/result");
const { isWebUri } = require("valid-url");
const { curry, split, nth, prop } = require("ramda");
const { isString, isArray } = require("lodash");
const { jwtSchema } = require("../../constants");

// safeSplit :: a -> Result(Error, [a])
const safeSplit = x => Result.try(_ =>
    split('.', x)
);

// safeNth :: [a] -> Result(Error, a)
const safeNth = x =>
    Result.try(_ => {
        if(isArray(x))
            return nth(1, x);
        throw Error("Array was not provided as input");
    });

// safeBase64ToBuffer :: a -> Result(Error, Buffer a)
const safeBase64ToBuffer = x => Result.try(_ => {
    if(isString(x))
        return Buffer.from(x, "base64");
    throw Error(x);
});

// safeJsonParse :: a -> Result(Error, b)
const safeJsonParse = x =>
    Result.try(_ => {
        if(isString(x))
            return JSON.parse(x);
        throw Error("String not provided as an input");
    });

// safeIsWebUri :: a -> Result(Error, boolean)
const safeIsWebUri = x =>
    Result.try(_ => {
        if(isString(x))
            return isWebUri(x);
        throw Error("String not provided as an input");
    });

// safeMakeWebUrl :: a -> a -> Result(Error, a)
const safeMakeWebUrl = curry((x, y) =>
    Result.try(_ =>
        url.resolve(y, x)
    )
);

// safeGetAegisUrl :: a -> b | null
const safeGetAegisUrl = x =>
    Result.try(_ => {
        if(new Ajv({ coerceTypes: false }).compile(jwtSchema)(x))
            return prop('aegis', x);
        throw Error("JWT has invalid schema");
    });

module.exports = {
    safeSplit,
    safeNth,
    safeBase64ToBuffer,
    safeJsonParse,
    safeIsWebUri,
    safeMakeWebUrl,
    safeGetAegisUrl
};