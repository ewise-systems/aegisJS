import { compose, pipe, toString as toStr, split, nth, prop } from "ramda";
import { Left, Right } from "../structs/Either";
import { either, id, toNull, on, otherwise } from "../fpcore/pointfree";
import { matchCase } from "./matchCase";
// const { isString } = require("lodash/fp");

const isString = (x: any) => typeof x === 'string';

const base64ToBuffer = (x: string) => Buffer.from(x, 'base64');

const parseJSON = (x: string) => {
    try {
        if(typeof x !== 'string') return new Left("Not a JSON string");
        if(!isNaN(Number(x))) return new Left("Not a JSON string");
        if(!x) return new Left("Not a JSON string");
        return new Right(JSON.parse(x));
    } catch(e) {
        return new Left(e);
    }
};

const stringToBuffer =
    pipe(
        matchCase,
        on(isString, base64ToBuffer),
        otherwise(toNull)
    );

const getBodyFromJWT =
    pipe(
        toStr,
        split('.'),
        nth(1),
        stringToBuffer,
        toStr,
        parseJSON,
        either(toNull, id)
    );

// @ts-ignore
const getUrlFromJWT = compose(prop('aegis'), getBodyFromJWT);

export {
    isString,
    base64ToBuffer,
    parseJSON,
    stringToBuffer,
    getBodyFromJWT,
    getUrlFromJWT
}