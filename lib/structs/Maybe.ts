// https://mostly-adequate.gitbooks.io/mostly-adequate-guide/appendix_b.html#maybe
import { id } from "../fpcore/pointfree";

class Maybe {
  public $value: any;

  get isNothing() {
    return this.$value === null || this.$value === undefined;
  }

  get isJust() {
    return !this.isNothing;
  }

  constructor(x: any) {
    this.$value = x;
  }

  inspect() {
    return this.isNothing ? 'Nothing' : `Just(${this.$value})`;
  }

  // ----- Pointed Maybe
  static of(x: any) {
    return new Maybe(x);
  }

  // ----- Functor Maybe
  map(fn: any) { // TODO: Not really any
    return this.isNothing ? this : Maybe.of(fn(this.$value));
  }

  // ----- Applicative Maybe
  ap(f: any) { // TODO: Not really any
    return this.isNothing ? this : f.map(this.$value);
  }

  // ----- Monad Maybe
  chain(fn: any) { // TODO: Not really any
    return this.map(fn).fold();
  }

  fold(x?: any) { // TODO: Not really any
    return this.isNothing ? (x ? x : this) : this.$value;
  }

  // ----- Traversable Maybe
  sequence(of: any) { // TODO: Not really any
    this.traverse(of, id);
  }

  traverse(of: any, fn: any) { // TODO: Not really any
    return this.isNothing ? of(this) : fn(this.$value).map(Maybe.of);
  }
}

export {
  Maybe
}