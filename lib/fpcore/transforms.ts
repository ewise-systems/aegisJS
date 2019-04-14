// @ts-ignore
const Task = require("../structs/Task");

// promiseToTask :: Promise a b -> Task a b
// @ts-ignore
const promiseToTask = x => new Task((reject, resolve) => x.then(resolve).catch(reject));

// taskToPromise :: Task a b -> Promise a b
// @ts-ignore
const taskToPromise = x => new Promise((resolve, reject) => x.fork(reject, resolve));

module.exports = {
    promiseToTask,
    taskToPromise
};