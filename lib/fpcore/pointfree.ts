// @ts-ignore
const { curry } = require("ramda/es");

// @ts-ignore
const addProp = curry((obj, key, value) =>
    ({ ...obj, [key]: value })
);

// @ts-ignore
const decorateClassInstance = curry((key, value, inst) =>
    Object.setPrototypeOf(
        { ...inst, [key]: value(inst) },
        Object.getPrototypeOf(inst)
    )
);

module.exports = {
    addProp,
    decorateClassInstance
};