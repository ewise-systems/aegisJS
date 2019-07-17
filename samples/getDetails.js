const doGetDetails = () => {
    const jwtOrUrl = prompt("Please enter a JWT or PDV URL");

    const errorCallback = msg => error => console.log(`Error Encountered from ${msg}:`, error);
    const successCallback = msg => data => console.log(`Data Received from ${msg}:`, data);
    const details = aegis.getDetails({jwtOrUrl});

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
}