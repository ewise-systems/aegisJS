const doRunBrowser = () => {
    const jwtOrUrl = prompt("Please enter a JWT or PDV URL");

    const errorCallback = msg => error => console.log(`Error Encountered from ${msg}:`, error);
    const successCallback = msg => data => console.log(`Data Received from ${msg}:`, data);
    const browser = aegis.runBrowser({jwtOrUrl});

    // Monadic Implementation
    browser.run().listen({
        onRejected: errorCallback('monad'),
        onResolved: successCallback('monad')
    });

    // Promise Implementation
    browser
    .run()
    .promise()
    .then(successCallback('promise'))
    .catch(errorCallback('promise'));
}