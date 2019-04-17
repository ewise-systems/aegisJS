// https://mostly-adequate.gitbooks.io/mostly-adequate-guide/appendix_b.html#identity
import { id } from "../fpcore/pointfree";

class Identity {
  public $value: any;

  constructor(x: any) {
    this.$value = x;
  }

  inspect() {
    return `Identity(${this.$value})`;
  }

  // ----- Pointed Identity
  static of(x: any) {
    return new Identity(x);
  }

  // ----- Functor Identity
  map(fn: any) { // TODO: Not really any
    return Identity.of(fn(this.$value));
  }

  // ----- Applicative Identity
  ap(f: any) { // TODO: Not really any
    return f.map(this.$value);
  }

  // ----- Monad Identity
  chain(fn: any) { // TODO: Not really any
    return this.map(fn).fold();
  }

  fold() {
    return this.$value;
  }

  // ----- Traversable Identity
  sequence(of: any) { // TODO: Not really any
    return this.traverse(of, id);
  }

  traverse(of: any, fn: any) { // TODO: Not really any
    return fn(this.$value).map(Identity.of);
  }
}

export {
  Identity
}