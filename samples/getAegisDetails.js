const baseUrl = 'https://pdv.ewise.com:8443/';
const details = ew.init(baseUrl, null).public.getAegisDetails;
const errorCallback = error => console.log('Error Encountered:', error);
const successCallback = data => console.log('Data Received:', data);

// Monadic Implementation
details.fork(errorCallback, successCallback);

// Promise Implementation
details.toPromise().then(successCallback).catch(errorCallback);