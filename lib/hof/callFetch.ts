require('whatwg-fetch');
import { concat, curry } from "ramda";
import { Task } from "../structs/Task";
import { Identity } from "../structs/Identity";
import { Maybe } from "../structs/Maybe";
import { liftA3 } from "../fpcore/liftA";
import { addProp } from "../fpcore/pointfree";

interface FetchOptions {
    method: string;
    headers?: {
        "Content-Type": string;
        "Authorization": string;
        [key: string]: any;
    };
    body?: any;
}

const sendRequest = curry((url, method, token, body) =>
    new Task((reject, result) =>
        fetch(url, {...method, headers: {...token}, ...body})
        .then(async response => {
            const data = await response.json();
            return response.status === 200 ? result(data) : reject(data);
        })
        .catch(reject)
    )
);

const addMethod = curry((method: string, obj: FetchOptions) =>
    Maybe.of(method).map(addProp(obj, 'method')).fold({})
);

const addAuthHeader = curry((token: string, obj: FetchOptions) =>
    Maybe.of(token).map(concat('Bearer ')).map(addProp(obj, 'Authorization')).map((x: any) => ({ ...x, "Content-Type": "application/json" })).fold({})
);

const addBody = curry((body: string, obj: FetchOptions) =>
    Maybe.of(body).map(JSON.stringify).map(addProp(obj, 'body')).fold({})
);

// @ts-ignore
const callFetch = curry((url: string, method: string, token: string, body: any) =>
    liftA3(
        sendRequest(url),
        addMethod(method),
        addAuthHeader(token),
        addBody(body),
        Identity.of({})
    )
    // @ts-ignore
    .fold()
);

// @ts-ignore
export {
    sendRequest,
    addMethod,
    addAuthHeader,
    addBody,
    callFetch
};