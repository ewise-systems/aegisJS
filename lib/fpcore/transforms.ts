import { Task } from "../structs/Task";

// TODO: x is a promise
// promiseToTask :: Promise a b -> Task a b
const promiseToTask = (x: any) => new Task((reject, resolve) => x.then(resolve).catch(reject));

// TODO: x is a task
// taskToPromise :: Task a b -> Promise a b
const taskToPromise = (x: any) => new Promise((resolve, reject) => x.fork(reject, resolve));

export {
    promiseToTask,
    taskToPromise
}