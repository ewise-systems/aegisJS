# aegisJS

[![Build Status](https://travis-ci.org/ewise-systems/aegisJS.svg?branch=develop)](https://travis-ci.org/ewise-systems/aegisJS) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](code-of-conduct.md) [![dependencies Status](https://david-dm.org/ewise-systems/aegisJS/status.svg)](https://david-dm.org/ewise-systems/aegisJS)

Server side data aggregation using eWise Systems' Aegis 2.0 architecture.

## Installation

To use this package at all, you must have separately installed the [eWise Aegis 2.0 PDV](https://www.ewise.com/) to your system, or you must have been provided with an access token by the eWise team to connect to a remotely hosted one.

Once you have secured your access, use the package manager [npm](https://www.npmjs.com/) to install aegisJS.

```bash
npm install aegisJS
```

Alternatively, you can download the aegisJS file from the eWise CDN (to be hosted).

## Usage

When requiring aegisJS in the browser, the library is available through the `ewise_aegisJS` function. When called, this returns the `aegis` object which can talk to the eWise PDV.

```javascript
const aegis = ewise_aegisJS();

aegis.getDetails("http://localhost:8000").run();
```

This library returns Task monads for one-off requests to the Aegis PDV and RxJS streams for continuous requests. In the case of a Task monad being returned, it can be converted to a promise should you be more comfortable in that style. However, it is recommended to use the monadic style instead of the promise.

```javascript
// Monadic implementation
aegis.getDetails("http://localhost:8000").run().listen({
    onRejected: errorCallback,
    onResolved: successCallback
});

// Promise-based implementation
aegis.getDetails("http://localhost:8000").run().promise()
    .then(successCallback)
    .catch(errorCallback);
```

## Example

When run, this example will output the data twice: once for the monadic approach, and again for the promise-based approach.

```javascript
const aegis = ewise_aegisJS();
const input = /* Contains a valid eWise-issued JWT */;

const errorCallback = msg => error => console.log(`Error Encountered from ${msg}:`, error);
const successCallback = msg => data => console.log(`Data Received from ${msg}:`, data);

const details = aegis.getDetails(input);

// Monadic Implementation
details.run().listen({
    onRejected: errorCallback('monad'),
    onResolved: successCallback('monad')
});

// Promise Implementation
details
.run()
.promise()
.then(successCallback('promise'))
.catch(errorCallback('promise'));
```

For more concrete examples, take a look at the `samples/` folder. You can execute these functions by running `npm start` and visiting `localhost:3000`. These functions, as well as the `aegis` object, should be available in the global scope for you to play with and learn from.

## ewise_aegisJS

### ewise_aegisJS(options)

This function wraps the `aegis` object and controls how it is instantiated.

* `options` \<Object>
  * `jwt` \<String> When provided, this is the JWT that will be used for all requests, unless specifically overriden in the function's parameters.
* Returns: `AegisObject`

## AegisObject

### getDetails([accessPoint])

The function is called with either a URL or a JWT because a JWT is not required to learn the running PDV's version as long as you know the URL to that PDV instance.

* `accessPoint` \<String> A URL to connect to a local or remote running PDV instance, or a valid eWise-issued JWT that contains this URL.
* Returns: `Task(Error, AegisDetailsObjectResult)`

##### AegisDetailsObjectResult
* `aegis` \<String> The version of the aegis instance.
* `engine` \<String> The version of the engine instance.

### runBrowser([accessPoint])

Calling this function does not do anything, but it is useful to test that the JxBrowser installation is successful. This will open a JxBrowser instance in the local device.

* `accessPoint` \<String> A URL to connect to a local or remote running PDV instance, or a valid eWise-issued JWT that contains this URL.
* Returns: `Task(Error, EmptyObject)`

### initializeOta(instCode, prompts[, jwt])

Returns an object that can get valid institutions for data aggregation and their prompts, as well as provide means to start, stop and resume the aggregation.

* `instCode` \<String> An institution code that is registered in the eWise PDV.
* `prompts` Array\<Prompt> An array of objects. Each object is made of a `key` corresponding to the `key` returned in `getInstitutions`, and a `value` corresponding to the user-supplied credentials for that key.
* `jwt` \<String> A valid eWise-issued JWT.
* Returns: `OTAControlObject`

## OTAControlObject

### run()

Upon calling this function, the aggregation will return immediately run.

An object that contains a stream and methods to control it. The stream filters out data when it receives duplicate events from the PDV server.

* Returns: a monadic event stream which can be mapped, switched, flattened, etc. Each stream event is a `PDVPollingObject`. Subscribing to this stream will grant you access to each event.

##### PDVPollingObject
* `processId` \<String> A string that uniquely identifies a currently running process.
* `profileId` \<String> A string that uniquely identifies a user's account for a certain institution.
* `status` \<String> Describes the status of the currently running process. It can be `running`, `error`, `userInput`, `stopped`, `partial`, or `done`
* `type` \<String> A string that describes the type of action being performed. Can be `aggregate`.

### resume(prompts)

Resumes the aggregation if it is paused, allowing the stream to continue. Takes an array of Prompts as input.

* Returns: `Task(Error, {})`

### stop()

Terminates the aggregation, which will eventually terminate the stream.

* Returns: `Task(Error, {})`

## Contributing and Community Guidelines
Please see our [contributing guide](https://github.com/ewise-systems/aegisJS/blob/develop/CONTRIBUTING.md) and our [code of conduct](https://github.com/ewise-systems/aegisJS/blob/develop/CODE_OF_CONDUCT.md) for guides on how to contribute to this project.

## License
[MIT](https://github.com/ewise-systems/aegisJS/blob/develop/LICENSE)