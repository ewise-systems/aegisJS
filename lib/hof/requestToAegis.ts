import { compose, curry, map } from "ramda";
import { invokeFetch, decoWithToPromise } from "./invokeFetch";
import { getUrl } from "./getUrl";
import { Task } from"../structs/Task";

const DEFAULT_ERR_OBJ = { code: -1, message: "Request not sent. Something went wrong. Token or URL may be malformed." };

const showFacade = (x: any) => x.isJust ? x.fold() : decoWithToPromise(new Task(rj => rj(DEFAULT_ERR_OBJ)));

const requestToAegis = curry((method, jwt, body, path) =>
    // @ts-ignore
    compose(showFacade, map(invokeFetch(method, jwt, body)), getUrl(path))
);

export {
    showFacade,
    requestToAegis
};