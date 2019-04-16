const doRunBrowser = () => {
    const input = prompt("Please enter a JWT or PDV URL");

    const errorCallback = msg => error => console.log(`Error Encountered from ${msg}:`, error);
    const successCallback = msg => data => console.log(`Data Received from ${msg}:`, data);
    const browser = aegis.runBrowser(input);

    // Monadic Implementation
    browser.fork(errorCallback('monad'), successCallback('monad'));

    // Promise Implementation
    browser.toPromise().then(successCallback('promise')).catch(errorCallback('promise'));
}