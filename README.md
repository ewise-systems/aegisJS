# aegisJS

[![Build Status](https://travis-ci.org/ewise-systems/aegisJS.svg?branch=develop)](https://travis-ci.org/ewise-systems/aegisJS) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](code-of-conduct.md) [![dependencies Status](https://david-dm.org/ewise-systems/aegisJS/status.svg)](https://david-dm.org/ewise-systems/aegisJS)

Server side data aggregation using eWise Systems' Aegis 2.0 architecture.

## Installation

To use this package at all, you must have separately installed the [eWise Aegis 2.0 PDV](https://www.ewise.com/) to your system, or you must have been provided with an access token by the eWise team to connect to a remotely hosted one.

Once you have secured your access, use the package manager [npm](https://www.npmjs.com/) to install aegisJS.

```bash
npm install @ewise/aegisjs
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
  * `jwt` \<String> When provided, this is the JWT that will be used for all requests, unless specifically overriden in the function's parameters. When provided, this value becomes `defaultJwt`
* Returns: `AegisObject`

## AegisObject

### getDetails([options])

This function handles getting the details of the eWise engine you are connecting to.

* `options` \<Object>
  * `jwtOrUrl` \<String> A URL to connect to a local or remote running PDV instance, or a valid eWise-issued JWT that contains this URL. A JWT is not required to learn the running PDV's version as long as you know the URL to that PDV instance. Default: `defaultJwt`
* Returns: `Task(Error, AegisDetailsObjectResult)`

##### AegisDetailsObjectResult
* `aegis` \<String> The version of the aegis instance.
* `engine` \<String> The version of the engine instance.

### runBrowser([accessPoint])

Calling this function will open a JxBrowser instance in the local device.

* `options` \<Object>
  * `jwtOrUrl` \<String> A URL to connect to a local or remote running PDV instance, or a valid eWise-issued JWT that contains this URL. A JWT is not required to learn the running PDV's version as long as you know the URL to that PDV instance. Default: `defaultJwt`
* Returns: `Task(Error, EmptyObject)`

### getInstitutions([options])

The institutions returned here are those that were made available to the client and can be aggregated with the proper credentials.

* `options` \<Object>
  * `instCode` \<String> An institution code that is registered in the eWise PDV.
  * `jwt` \<String> A valid eWise-issued JWT. Default: `defaultJwt`
* Returns: `Task(Error, GroupInstitutionsObject | OneInstitutionObject)`

##### GroupInstitutionsObject
* `content` Array\<InstitutionGroup>

##### InstitutionGroup
* `name` \<String> The name of the institution group.
* `description` \<String> A description of the institution group.
* `institutions` Array\<Institution> A list of valid instutitions.

##### Institution
* `code` \<Number> A digit that represents a valid institution that can be aggregated.
* `name` \<String> The name of the institution.

##### OneInstitutionObject
* `code` \<Number> A digit that represents a valid institution that can be aggregated.
* `name` \<String> The name of the institution.
* `prompts` Array\<InstitutionPrompt> A list of prompts required by the institution.

##### InstitutionPrompt
* `editable` \<Boolean> Describes if the prompt's value can be changed.
* `index` \<Integer> Positional descriptor of the prompt in an array.
* `key` \<String> The `key` value which must be returned to the PDV upon supplying the prompt's value.
* `label` \<String> The text that should be displayed to the user upon requesting for the prompt.
* `primary` \<Boolean> Whether the prompt is the main one or not.
* `required` \<Boolean> Whether the prompt is required or not.
* `value` \<Boolean> A default value that must be updated with a user-supplied input if the prompt is editable.
* `type` \<Boolean> Can be `lov` (list of values), `input` (string), `image` (base64 image data string), and `password` (sensitive string).

### initializeOta([options])

Returns an object that can get valid institutions for data aggregation and their prompts, as well as provide means to start, stop and resume the aggregation.

* `options` \<Object>
  * `instCode` \<String> An institution code that is registered in the eWise PDV.
  * `prompts` Array\<Prompt> An array of objects. Each object is made of a `key` corresponding to the `key` returned in `getInstitutions`, and a `value` corresponding to the user-supplied credentials for that key.
  * `jwt` \<String> A valid eWise-issued JWT. Default: `defaultJwt`
* Returns: `StreamControlObject`

## StreamControlObject

### run()

Upon calling this function, the aggregation will return immediately run.

An object that contains a stream and methods to control it. The stream filters out data when it receives duplicate events from the PDV server.

* Returns: a monadic event stream which can be mapped, switched, flattened, etc. Each stream event is a `PollingObject`. Subscribing to this stream will grant you access to each event.

##### PollingObject
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

### addProfile([options])

Returns an object that can get valid institutions for data aggregation and their prompts, as well as provide means to start, stop and resume the aggregation.

* `options` \<Object>
  * `instCode` \<String> An institution code that is registered in the eWise PDV.
  * `prompts` Array\<Prompt> An array of objects. Each object is made of a `key` corresponding to the `key` returned in `getInstitutions`, and a `value` corresponding to the user-supplied credentials for that key.
  * `jwt` \<String> A valid eWise-issued JWT. Default: `defaultJwt`
* Returns: `StreamControlObject`

### addBasicProfile([options])

Returns an object that can get valid institutions for data aggregation and their prompts, as well as provide means to start, stop and resume the aggregation.

* `options` \<Object>
  * `instCode` \<String> An institution code that is registered in the eWise PDV.
  * `prompts` Array\<Prompt> An array of objects. Each object is made of a `key` corresponding to the `key` returned in `getInstitutions`, and a `value` corresponding to the user-supplied credentials for that key.
  * `jwt` \<String> A valid eWise-issued JWT. Default: `defaultJwt`
* Returns: `StreamControlObject`

### getProfiles([options])

This function handles getting the user profiles of a user.

* `options` \<Object>
  * `profileId` \<String> A string that identifies a specific account from an institution, tenant, and user.
  * `cred` \<String> Flag to identify if the fetch operation is to get credentials. Default: `false`
  * `jwt` \<String> A valid eWise-issued JWT. Default: `defaultJwt`
* Returns: `Task(Error, AegisDetailsObjectResult)`

### updateProfile([options])

Returns an object that can get valid institutions for data aggregation and their prompts, as well as provide means to start, stop and resume the aggregation.

* `options` \<Object>
  * `profileId` \<String> A string that identifies a specific account from an institution, tenant, and user.
  * `instCode` \<String> An institution code that is registered in the eWise PDV.
  * `prompts` Array\<Prompt> An array of objects. Each object is made of a `key` corresponding to the `key` returned in `getInstitutions`, and a `value` corresponding to the user-supplied credentials for that key.
  * `jwt` \<String> A valid eWise-issued JWT. Default: `defaultJwt`
* Returns: `StreamControlObject`

### updateBasicProfile([options])

Returns an object that can get valid institutions for data aggregation and their prompts, as well as provide means to start, stop and resume the aggregation.

* `options` \<Object>
  * `profileId` \<String> A string that identifies a specific account from an institution, tenant, and user.
  * `instCode` \<String> An institution code that is registered in the eWise PDV.
  * `prompts` Array\<Prompt> An array of objects. Each object is made of a `key` corresponding to the `key` returned in `getInstitutions`, and a `value` corresponding to the user-supplied credentials for that key.
  * `jwt` \<String> A valid eWise-issued JWT. Default: `defaultJwt`
* Returns: `StreamControlObject`

### getAccounts([options])

This function handles getting the details of the eWise engine you are connecting to.

* `options` \<Object>
  * `jwt` \<String> A valid eWise-issued JWT. Default: `defaultJwt`
* Returns: `Task(Error, ContentAccountsObject)`

##### ContentAccountsObject
* `content` Array\<AccountsObject>

##### AccountsObject
* `accountId` \<String> A string that uniquely identifies an account from a profile owned by a user.
* `number` \<String> The account number used by the insitution.
* `name` \<String> The name of the account.
* `currency` \<String> The three-letter currency of the account.
* `type` \<Enum String> The type of account.
* `balance` \<Number> The total balance in the account.
* `availableBalance` \<Number> The balance that can be spent.
* `joint` \<String> A string that can identify joint accounts across different profiles.
* `additionalInfo` \<String> A stringified object with additional information about the account.
* `profileId` \<String> A unique string that represents one profile owned by the user.
* `updatedAt` \<Number> A UNIX timestamp of when the account details were last refreshed.

### getTransactions([options])

This function handles getting the details of the eWise engine you are connecting to.

* `options` \<Object>
  * `jwt` \<String> A valid eWise-issued JWT. Default: `defaultJwt`
* Returns: `Task(Error, AllTransactionsObject)`

##### AllTransactionsObject
* `filters` Array\<FilterObject>
* `content` Array\<TransactionsObject>

##### FilterObject
* `property` \<String> The property of the AccountsObject being filtered.
* `value` \<String> The condition to apply upon the property being filtered.

##### TransactionsObject
* `transactionId` \<String> A string that uniquely identifies a transaction from an account of a profile owned by a user.
* `amount` \<String> The amount transferred in the transaction.
* `currency` \<String> The three-letter currency of the account.
* `date` \<String> A date in YYYY-MM-DD format describing when the transaction was posted.
* `description` \<String> The description of the transaction.
* `joint` \<String> A string that can identify joint accounts across different profiles.
* `additionalInfo` \<String> A stringified object with additional information about the account.
* `accountId` \<String> A string that uniquely identifies an account from a profile owned by a user.
* `profileId` \<String> A unique string that represents one profile owned by the user.

## Contributing and Community Guidelines
Please see our [contributing guide](https://github.com/ewise-systems/aegisJS/blob/develop/CONTRIBUTING.md) and our [code of conduct](https://github.com/ewise-systems/aegisJS/blob/develop/CODE_OF_CONDUCT.md) for guides on how to contribute to this project.

## License
[MIT](https://github.com/ewise-systems/aegisJS/blob/develop/LICENSE)