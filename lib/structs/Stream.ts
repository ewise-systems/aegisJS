// @ts-ignore
const { curry } = require("ramda/es");

// @ts-ignore
class Stream {
    constructor(pred, subscriber) {
        // @ts-ignore
        this.subscribe = curry(subscriber)(pred);
    }
}

/*
    curry = fn => {
        const arity = fn.length;

        const $curry = (...args) => {
            if (args.length < arity) {
            return $curry.bind(null, ...args)
            }

            return fn.call(null, ...args)
        }
        return $curry
    }

    x = new Stream(
        data => data === 0,
        (pred, next, error, complete) => {
            const timer = time => setTimeout(async () => {
                try {
                    console.log('Interval is still running');
                    // TODO: Memoize this.
                    // Always call next first so the client can handle events.
                    // next() functions must always be awaited (next functions must be async) for OTP events.
                    // next() functions must always return a value.
                    const x = await next(time);
                    pred(time) ? complete(time) : timer(x);
                } catch (e) {
                    error(e);
                }
            }, 500)
            timer(10)
        }
    )

    x.subscribe(
        async data => {
            console.log('Got ', data, '. Next...')
            if(data === 3) {
                prompt('Enter next number')
            }
            return data - 1
        },
        err => console.log('Oops, error occurred. Stopped subscribing...', err),
        data => console.log('Finally got', data, '! Not subscribing anymore')
    )
*/

module.exports = Stream;