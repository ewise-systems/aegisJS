// https://mostly-adequate.gitbooks.io/mostly-adequate-guide/appendix_b.html#either
import { id } from "../fpcore/pointfree";

export class Either {
  constructor(x: any) {
    // @ts-ignore
    this.$value = x;
  }

  // ----- Pointed (Either a)
  static of(x: any) {
    return new Right(x);
  }
}

// @ts-ignore
export class Right extends Either {
  get isLeft() {
    return false;
  }

  get isRight() {
    return true;
  }

  static of(x: any) {
    throw new Error('`of` called on class Right (value) instead of Either (type)');
  }

  inspect() {
    // @ts-ignore
    return `Right(${this.$value})`;
  }

  // ----- Functor (Either a)
  // @ts-ignore
  map(fn) {
    // @ts-ignore
    return Either.of(fn(this.$value));
  }

  // ----- Applicative (Either a)
  // @ts-ignore
  ap(f) {
    // @ts-ignore
    return f.map(this.$value);
  }

  // ----- Monad (Either a)
  // @ts-ignore
  chain(fn) {
    // @ts-ignore
    return fn(this.$value);
  }

  fold() {
    // @ts-ignore
    return this.$value;
  }

  // ----- Traversable (Either a)
  // @ts-ignore
  sequence(of) {
    // @ts-ignore
    return this.traverse(of, id);
  }

  // @ts-ignore
  traverse(of, fn) {
    // @ts-ignore
    fn(this.$value).map(Either.of);
  }
}

// @ts-ignore
export class Left extends Either {
  get isLeft() {
    return true;
  }

  get isRight() {
    return false;
  }

  // @ts-ignore
  static of(x) {
    throw new Error('`of` called on class Left (value) instead of Either (type)');
  }

  inspect() {
    // @ts-ignore
    return `Left(${this.$value})`;
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
  // @ts-ignore
  sequence(of) {
    return of(this);
  }

  // @ts-ignore
  traverse(of, fn) {
    return of(this);
  }
}