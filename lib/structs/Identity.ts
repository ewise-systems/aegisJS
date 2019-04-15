// https://mostly-adequate.gitbooks.io/mostly-adequate-guide/appendix_b.html#identity
// @ts-ignore
const { inspect } = require('util');

// @ts-ignore
class Identity {
  constructor(x) {
      // @ts-ignore
    this.$value = x;
  }

  inspect() {
    // @ts-ignore
    return `Identity(${inspect(this.$value)})`;
  }

  // ----- Pointed Identity
  static of(x) {
    return new Identity(x);
  }

  // ----- Functor Identity
  map(fn) {
    // @ts-ignore
    return /*console.log(fn) || */Identity.of(fn(this.$value));
  }

  // ----- Applicative Identity
  ap(f) {
    // @ts-ignore
    return f.map(this.$value);
  }

  // ----- Monad Identity
  chain(fn) {
    return this.map(fn).fold();
  }

  fold() {
    // @ts-ignore
    return this.$value;
  }

  // ----- Traversable Identity
  sequence(of) {
    // @ts-ignore
    return this.traverse(of, x => x);
  }

  traverse(of, fn) {
    // @ts-ignore
    return fn(this.$value).map(Identity.of);
  }
}

module.exports = Identity;