// @ts-ignore
const { Left, Right } = require("../structs/Either");

// @ts-ignore
const base64ToBuffer = x => Buffer.from(x, 'base64');

// @ts-ignore
const parseJSON = x => {
    try {
        return Right(JSON.parse(x));
    } catch(e) {
        return Left(e);
    }
}

module.exports = {
    base64ToBuffer,
    parseJSON
};