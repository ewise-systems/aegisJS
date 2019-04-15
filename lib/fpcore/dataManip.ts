// @ts-ignore
const { compose, pipe, toString: toStr, split, nth, prop } = require("ramda/es");
// @ts-ignore
const { Left, Right } = require("../structs/Either");
// @ts-ignore
const { either, id, toNull } = require("../fpcore/pointfree");

// @ts-ignore
const base64ToBuffer = x => Buffer.from(x, 'base64');

// @ts-ignore
const parseJSON = x => {
    try {
        return Right(JSON.parse(x));
    } catch(e) {
        return Left(e);
    }
};

// @ts-ignore
const getBodyFromJWT =
    pipe(
        toStr,
        split('.'),
        nth(1),
        base64ToBuffer,
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