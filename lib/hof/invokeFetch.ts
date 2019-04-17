import { compose, curry } from "ramda";
import { callFetch } from "./callFetch";
import { taskToPromise } from "../fpcore/transforms";
import { decorateClassInstance as decorate } from "../fpcore/pointfree";

// TODO: Not really any
const toPromise = (task: any) => () => taskToPromise(task);

const decoWithToPromise = decorate('toPromise', toPromise);

const makeFetchMonad = compose(decoWithToPromise, callFetch);

// @ts-ignore
const invokeFetch = curry((method, token, body, url) => makeFetchMonad(url, method, token, body));

export {
    toPromise,
    makeFetchMonad,
    decoWithToPromise,
    invokeFetch
};