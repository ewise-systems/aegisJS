// @ts-ignore
const { curry } = require("ramda/es");

// @ts-ignore
const addProp = curry((obj, key, value) =>
    ({ ...obj, [key]: value })
);

module.exports = {
    addProp
};