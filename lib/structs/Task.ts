// https://mostly-adequate.gitbooks.io/mostly-adequate-guide/appendix_b.html#task
import { compose } from "ramda";
import { id } from "../fpcore/pointfree";

class Task {
  public fork: (a: (c: any) => void, b: (d: any) => void) => void;

  constructor(fork: (a: (c: any) => void, b: (d: any) => void) => void) {
    this.fork = fork;
  }

  inspect() {
    return 'Task(?)';
  }

  static rejected(x: any) {
    return new Task((reject, _) => reject(x));
  }

  // ----- Pointed (Task a)
  static of(x: any) {
    return new Task((_, resolve) => resolve(x));
  }

  // ----- Functor (Task a)
  map(fn: any) { // TODO: Not really any type
    return new Task((reject, resolve) => this.fork(reject, compose(resolve, fn)));
  }

  // ----- Applicative (Task a)
  ap(f: any) { // TODO: Not really any type
    return this.chain((fn: any) => f.map(fn));
  }

  // ----- Monad (Task a)
  chain(fn: any) { // TODO: Not really any type
    return new Task((reject, resolve) => this.fork(reject, x => fn(x).fork(reject, resolve)));
  }

  fold() {
    return this.chain(id);
  }
}

export {
  Task
}