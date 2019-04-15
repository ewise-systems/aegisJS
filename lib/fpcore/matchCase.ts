// Source
// https://codeburst.io/alternative-to-javascripts-switch-statement-with-a-functional-twist-3f572787ba1c
// @ts-ignore
const matchedCase = x => ({
    on: () => matchedCase(x),
    otherwise: () => x
});

// @ts-ignore
const matchCase = x => ({  
    on: (pred, fn) => pred(x) ? matchedCase(fn(x)) : matchCase(x),
    otherwise: fn => fn(x)
});

module.exports = {
    matchedCase,
    matchCase
};