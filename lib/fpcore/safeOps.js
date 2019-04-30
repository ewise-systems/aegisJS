const url = require("url");
const Ajv = require("ajv");
const Result = require("folktale/result");
const { isWebUri } = require("valid-url");
const { curry, split, nth, prop } = require("ramda");
const { isString } = require("lodash");

// safeSplit :: a -> Result(Error, [a])
const safeSplit = x => Result.try(_ => split('.', x));

// safeNth :: [a] -> Result(Error, a)
const safeNth = x => Result.try(_ => nth(1, x));

// safeBase64ToBuffer :: a -> Result(Error, Buffer a)
const safeBase64ToBuffer = x => Result.try(_ => {
    if(isString(x)) return Buffer.from(x, 'base64');
    throw Error(x);
});

// safeJsonParse :: a -> Result(Error, b)
const safeJsonParse = x => Result.try(_ => JSON.parse(x));

// safeIsWebUri :: a -> Result(Error, boolean)
const safeIsWebUri = x => Result.try(_ => isWebUri(x));

// safeMakeWebUrl :: a -> a -> Result(Error, a)
const safeMakeWebUrl = curry((x, y) => Result.try(_ => url.resolve(y, x)));

// unsafeValidateAegisJwtSchema :: a -> boolean
const unsafeValidateAegisJwtSchema =
    new Ajv({
        coerceTypes: false
    })
    .compile({
        "type": "object",
        "properties": {
            "iss": {
                "type": "string",
                "format": "uri"
            },
            "aegis": {
                "type": "string",
                "format": "uri"
            },
            "tenant": {
                "type": "string"
            },
            "origins": {
                "type": "string",
                "format": "uri"
            },
            "sub": {
                "type": "string"
            },
            "email": {
                "type": "string",
                "format": "email"
            },
            "iat": {
                "type": "number"
            },
            "exp": {
                "type": "number"
            },
            "services": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "institutions": {
                "type": "array",
                "items": {
                    "type": "number"
                }
            },
            "hashes": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "swan": {
                "type": "string",
                "format": "uri"
            }
        },
        "required": [
            'iss',
            'aegis',
            'tenant',
            'origins',
            'sub',
            'email',
            'iat',
            'exp',
            'services',
            'institutions',
            'hashes',
            'swan'
        ]
    });

// safeGetAegisUrl :: a -> b | null
const safeGetAegisUrl = x =>
    Result.try(_ =>
        unsafeValidateAegisJwtSchema(x) ?
        prop('aegis', x) :
        null
    );

module.exports = {
    safeSplit,
    safeNth,
    safeBase64ToBuffer,
    safeJsonParse,
    safeIsWebUri,
    safeMakeWebUrl,
    unsafeValidateAegisJwtSchema,
    safeGetAegisUrl
};