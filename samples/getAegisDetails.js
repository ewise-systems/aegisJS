const baseUrl = 'https://pdv.ewise.com:8443/';
// const baseUrl = 'https://pdv.ewise.com:8443/fake-url';
// const baseUrl = 'not a url';
// const baseUrl = 12345;

const details = ew.getAegisDetails(baseUrl);
const errorCallback = error => console.log('Error Encountered:', error);
const successCallback = data => console.log('Data Received:', data);

// Monadic Implementation
details.fork(errorCallback, successCallback);

// Promise Implementation
details.toPromise().then(successCallback).catch(errorCallback);