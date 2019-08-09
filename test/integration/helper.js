const { compose } = require("ramda");
const { impostorPort200, impostorPort500, payload200, payload500 } = require("../../mountebank/settings");

const toBase64String = x => x.toString("base64");
const stringifyToBase64 = compose(toBase64String, Buffer.from, JSON.stringify);
const makeFakeJWTBody = port => ({
    "iss": "strings",
    "sub": "user",
    "iat": 1564394479,
    "exp": 2567296000,
    "email": "email@domain.com",
    "aegis": `http://127.0.0.1:${port}`,
    "tenant": "tenant",
    "origins": "strings",
    "swan": "https://www.domain.com",
    "institutions": [],
    "services": [],
    "hashes": []
});
const insertBodyInFakeJWT = x => `headers.${x}.signature`;
const makeFakeJWT = compose(insertBodyInFakeJWT, stringifyToBase64, makeFakeJWTBody);

const jwt200 = makeFakeJWT(impostorPort200);
const jwt500 = makeFakeJWT(impostorPort500);
const updateSite = "http://not.real.site";

module.exports = {
    impostorPort200,
    impostorPort500,
    jwt200,
    payload200,
    payload500,
    jwt500,
    updateSite
};