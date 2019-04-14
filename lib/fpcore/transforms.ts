// @ts-ignore
const Task = require("../structs/Task");

// promiseToTask :: Promise a b -> Task a b
// @ts-ignore
const promiseToTask = x => new Task((reject, resolve) => x.then(resolve).catch(reject));

module.exports = {
    promiseToTask
}