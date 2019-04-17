// Source
// https://codeburst.io/alternative-to-javascripts-switch-statement-with-a-functional-twist-3f572787ba1c
const matchedCase = (x: any) => ({
    on: () => matchedCase(x),
    otherwise: () => x
});

const matchCase = (x: any) => ({  
    // @ts-ignore
    on: (pred, fn) => pred(x) ? matchedCase(fn(x)) : matchCase(x),
    // @ts-ignore
    otherwise: fn => fn(x)
});

export {
    matchedCase,
    matchCase
}