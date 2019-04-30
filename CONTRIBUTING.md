# Welcome!

First of all, thank you for wanting to contribute to this project. This library was built with much love and enthusiasm by the team at eWise, and your interest is so important to us.

## Contributing

When contributing to this repository, please make an issue to discuss any bugs or other aspects of the code you wish to change. However, if you discover a security vulnerability, please do NOT make an issue about it. Email the team instead at the email addresses at the bottom of this document.

Please note we have a [code of conduct](https://github.com/ewise-systems/aegisJS/blob/develop/CODE_OF_CONDUCT). Please follow it in all your interactions with the project.

## What Contributions Are We Looking For?
We're the most in need of the following contributions:

1. Unit tests
2. Comments on already-working code, especially type-signatures
3. More examples

If you have a feature you would like to see added in or if you find a bug, please raise an issue first.

## Development Guide

##### Running locally
1. Clone the repository to your local machine.
2. Install all the dependencies with `npm install`
3. Run the development examples via `npm start`
4. Go to `localhost:3000` to see a sample app that consumes the aegis library

##### Building for production
Use `npm run build -- --mode=production`

##### Before a Pull Request
1. Ensure all the tests pass with `npm test`
2. Ensure the project remains at 100% code coverage from `npm test`
3. Ensure you are changing only code related to that one feature or bug
4. Ensure the project can bundle with `npm run build`

##### Pull Request Process
1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.
