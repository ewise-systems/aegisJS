const baseUrl = 'https://pdv.ewise.com:8443/';
const details = ew.init(baseUrl, null).getAegisDetails;
const errorCallback = error => console.log('Error Encountered:', error);
const successCallback = data => console.log('Data Received:', data);
details(errorCallback, successCallback);