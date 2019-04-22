const Ajv = require("ajv");
const Result = require("folktale/result");
const { isWebUri } = require("valid-url");
const { curry, split, nth, prop } = require("ramda");

const safeSplit = x => Result.try(_ => split('.', x));

const safeNth = x => Result.try(_ => nth(1, x));

const safeBase64ToBuffer = x => Result.try(_ => Buffer.from(x, 'base64'));

const safeJsonParse = x => Result.try(_ => JSON.parse(x));

const safeIsWebUri = x => Result.try(_ => isWebUri(x));

const safeMakeWebUrl = curry((x, y) => Result.try(_ => new URL(x, y).href));

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

const safeGetAegisUrl = x =>
    unsafeValidateAegisJwtSchema(x)
    ? prop('aegis', x)
    : null;

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