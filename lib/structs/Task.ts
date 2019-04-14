// https://mostly-adequate.gitbooks.io/mostly-adequate-guide/appendix_b.html#task
// @ts-ignore
const { compose } = require("ramda")

// @ts-ignore
class Task {
  constructor(fork) {
    // @ts-ignore
    this.fork = fork;
  }

  inspect() {
    return 'Task(?)';
  }

  static rejected(x) {
    return new Task((reject, _) => reject(x));
  }

  // ----- Pointed (Task a)
  static of(x) {
    return new Task((_, resolve) => resolve(x));
  }

  // ----- Functor (Task a)
  map(fn) {
    // @ts-ignore
    return new Task((reject, resolve) => this.fork(reject, compose(resolve, fn)));
  }

  // ----- Applicative (Task a)
  ap(f) {
    return this.chain(fn => f.map(fn));
  }

  // ----- Monad (Task a)
  chain(fn) {
    // @ts-ignore
    return new Task((reject, resolve) => this.fork(reject, x => fn(x).fork(reject, resolve)));
  }

  fold() {
    return this.chain(x => x);
  }
}

module.exports = Task