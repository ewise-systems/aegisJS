const { curry } = require("ramda");

const addProp = curry((obj, key, value) =>
    ({ ...obj, [key]: value })
);

const decorateClassInstance = curry((key, value, inst) =>
    Object.setPrototypeOf(
        { ...inst, [key]: value(inst) },
        Object.getPrototypeOf(inst)
    )
);

// either :: (a -> c) -> (b -> c) -> Either a b -> c
const either = curry((f, g, e) =>
    e.matchWith({
        Error: x => f(x),
        Ok: x => g(x)
    })
);

const toNull = _ => null;

module.exports = {
    addProp,
    decorateClassInstance,
    either,
    toNull
}