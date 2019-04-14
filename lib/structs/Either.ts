// https://mostly-adequate.gitbooks.io/mostly-adequate-guide/appendix_b.html#either
// @ts-ignore
const { inspect } = require('util');

class Either {
  constructor(x) {
    // @ts-ignore
    this.$value = x;
  }

  // ----- Pointed (Either a)
  static of(x) {
    return new Right(x);
  }
}

// @ts-ignore
class Right extends Either {
  get isLeft() {
    return false;
  }

  get isRight() {
    return true;
  }

  static of(x) {
    throw new Error('`of` called on class Right (value) instead of Either (type)');
  }

  inspect() {
    // @ts-ignore
    return `Right(${inspect(this.$value)})`;
  }

  // ----- Functor (Either a)
  map(fn) {
    // @ts-ignore
    return Either.of(fn(this.$value));
  }

  // ----- Applicative (Either a)
  ap(f) {
    // @ts-ignore
    return f.map(this.$value);
  }

  // ----- Monad (Either a)
  chain(fn) {
    // @ts-ignore
    return fn(this.$value);
  }

  fold() {
    // @ts-ignore
    return this.$value;
  }

  // ----- Traversable (Either a)
  sequence(of) {
    // @ts-ignore
    return this.traverse(of, x=>x);
  }

  traverse(of, fn) {
    // @ts-ignore
    fn(this.$value).map(Either.of);
  }
}

// @ts-ignore
class Left extends Either {
  get isLeft() {
    return true;
  }

  get isRight() {
    return false;
  }

  static of(x) {
    throw new Error('`of` called on class Left (value) instead of Either (type)');
  }

  inspect() {
    // @ts-ignore
    return `Left(${inspect(this.$value)})`;
  }

  // ----- Functor (Either a)
  map() {
    return this;
  }

  // ----- Applicative (Either a)
  ap() {
    return this;
  }

  // ----- Monad (Either a)
  chain() {
    return this;
  }

  fold() {
    return this;
  }

  // ----- Traversable (Either a)
  sequence(of) {
    return of(this);
  }

  traverse(of, fn) {
    return of(this);
  }
}


module.exports.Either = Either
module.exports.Left = Left
module.exports.Right = Right
