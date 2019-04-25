const { curry, equals, nth } = require("ramda");
const { interval, of } = require("rxjs");
const { bufferCount, catchError, take, takeWhile, filter, map, flatMap } = require('rxjs/operators');

const POLL_INTERVAL = 500; //ms

const poller$ = streamFactory =>
    interval(POLL_INTERVAL)
    .pipe(
        flatMap(streamFactory),
        bufferCount(2, 1),
        filter(([a, b]) => !equals(a, b)),
        map(nth(1)),
        catchError(x => of(x))
    )

const kickstart$ = curry((pred, iStream, hStream) =>
    iStream()
    .pipe(
        take(1),
        flatMap(({processId: pid}) => poller$(hStream(pid))),
        takeWhile(pred, true),
        catchError(x => of(x))
    )
)

module.exports = {
    const: { POLL_INTERVAL },
    poller$,
    kickstart$
};