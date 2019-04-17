const doGetDetails = () => {
    const input = prompt("Please enter a JWT or PDV URL");

    const errorCallback = msg => error => console.log(`Error Encountered from ${msg}:`, error);
    const successCallback = msg => data => console.log(`Data Received from ${msg}:`, data);
    const details = aegis.getDetails(input);

    // Monadic Implementation
    details.fork(errorCallback('monad'), successCallback('monad'));

    // Promise Implementation
    details.toPromise().then(successCallback('promise')).catch(errorCallback('promise'));
}