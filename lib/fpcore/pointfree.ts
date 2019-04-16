// @ts-ignore
import { curry } from "ramda";

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

// either :: (a -> c) -> (b -> c) -> Either a b -> c
// @ts-ignore
const either = curry((f, g, e) => {
    if (e.isLeft)  return f(e.$value);
    return g(e.$value);
})

// @ts-ignore
const on = curry((pred, fn, context) => context.on(pred, fn));

// @ts-ignore
const otherwise = curry((fn, context) => context.otherwise(fn));

// @ts-ignore
const id = x => x;

// fold :: (a -> b) -> F a -> b
// @ts-ignore
const fold = curry((x, F) => F.fold(x));

// @ts-ignore
const toNull = _ => null;

export {
    addProp,
    decorateClassInstance,
    either,
    on,
    otherwise,
    id,
    fold,
    toNull
}