// @ts-ignore
class Maybe {
  get isNothing() {
      // @ts-ignore
    return this.$value === null || this.$value === undefined;
  }

  get isJust() {
    return !this.isNothing;
  }

  constructor(x) {
      // @ts-ignore
    this.$value = x;
  }

  inspect() {
      // @ts-ignore
    return this.isNothing ? 'Nothing' : `Just(${inspect(this.$value)})`;
  }

  // ----- Pointed Maybe
  static of(x) {
    return new Maybe(x);
  }

  // ----- Functor Maybe
  map(fn) {
    // @ts-ignore
    return this.isNothing ? this : Maybe.of(fn(this.$value));
  }

  // ----- Applicative Maybe
  ap(f) {
    // @ts-ignore
    return this.isNothing ? this : f.map(this.$value);
  }

  // ----- Monad Maybe
  chain(fn) {
    return this.map(fn).fold();
  }

  fold(x?) {
    // @ts-ignore
    return this.isNothing ? (x ? x : this) : this.$value;
  }

  // ----- Traversable Maybe
  sequence(of) {
    // @ts-ignore
    this.traverse(of, identity);
  }

  traverse(of, fn) {
    // @ts-ignore
    return this.isNothing ? of(this) : fn(this.$value).map(Maybe.of);
  }
}

module.exports = Maybe