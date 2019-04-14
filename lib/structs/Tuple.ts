// @ts-ignore
const { inspect } = require('util')

// @ts-ignore
class Tuple {
  constructor(...args) {
    const value = Object.freeze(args)
    // @ts-ignore
    this.$value = value
  }

  get length() {
    // @ts-ignore
    return this.$value.length
  }

  concat(x) {
    // @ts-ignore
    return new Tuple(this.$value.concat(x.$value))
  }

  *[Symbol.iterator]() {
    // @ts-ignore
    for(let el of this.$value) {
      yield el
    }
  }

  map(fn) {
    // @ts-ignore
    return new Tuple(...this.$value.map(fn))
  }

  index(i) {
    // @ts-ignore
    return this.$value[i]
  }

  inspect() {
    // @ts-ignore
    return `Tuple(${JSON.stringify(this.$value).slice(1,-1)})`
  }
}

module.exports = Tuple
