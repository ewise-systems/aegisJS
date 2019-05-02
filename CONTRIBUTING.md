# Welcome!

First of all, thank you for wanting to contribute to this project. This library was built with much love and enthusiasm by the team at eWise, and your interest is so important to us.

## Contributing

When contributing to this repository, please make an issue to discuss any bugs or other aspects of the code you wish to change. However, if you discover a security vulnerability, please do NOT make an issue about it. Email the team instead at the email addresses at the bottom of this document.

Please note we have a [code of conduct](https://github.com/ewise-systems/aegisJS/blob/develop/CODE_OF_CONDUCT.md). Please follow it in all your interactions with the project.

## Philosophy

We wrote this library with these concepts in mind, and wish that all contributors follow suit:

1. Functions should be pure, or made pure by using higher order functions and/or monads
2. When an object is returned from the `aegis` object, its properties are monads, monadic streams, or higher order functions
3. Lazy evaluation is implemented such that the onus of side-effects rests purely on the consumer. As a result, when a monad is returned, it must have a `.run` method which the client calls to invoke the side-effects
4. We will never throw an exception from within the library. Should there be an unsafe function to call, we will convert it into a safe function first

## What Contributions Are We Looking For?
We're the most in need of the following contributions:

1. Unit tests
2. Comments on already-working code, especially type-signatures
3. More examples

If you have a feature you would like to see added in or if you find a bug, please raise an issue first.

## Writing Unit Tests
1. No scenario is too trivial to write a unit test for
2. Make one and only one assertion per `it` statement
3. Mimic the sentence-like construction of the existing tests, and make them descriptive.
  * "it should not throw" or "describe splitArray" are good
  * "it array containing values 1 and 2 should be equal to 3" or "describe test suite splitArray" are bad

## Development Guide

##### Running locally
1. Clone the repository to your local machine.
2. Install all the dependencies with `npm install`
3. Run the development examples via `npm start`
4. Go to `localhost:3000` to see a sample app that consumes the aegis library

##### Building for production
Use `npm run build -- --mode=production`

##### Before a Pull Request
1. Ensure it lints
2. Ensure all the tests pass with `npm test`
3. Ensure the project remains at 100% code coverage from `npm test`
4. Ensure the project can bundle with `npm run build`
5. Ensure you are changing only code related to one feature or bug

##### Pull Request Process
1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.
