const contract = require("../../mountebank/imposters");

const port = contract.port;
const url = `http://127.0.0.1:${port}`;
const jwtBody = JSON.stringify({
    "iss": "strings",
    "sub": "user",
    "iat": 1564394479,
    "exp": 2567296000,
    "email": "email@domain.com",
    "aegis": url,
    "tenant": "tenant",
    "origins": "strings",
    "swan": "https://www.domain.com",
    "institutions": [],
    "services": [],
    "hashes": []
});
const jwt = `headers.${Buffer.from(jwtBody).toString("base64")}.signature`;

module.exports = {
    port,
    url,
    jwtBody,
    jwt
};