const doOtaGetInstitutions = () => {
    const input = prompt("Please enter a JWT or PDV URL");
    const instCode = prompt("Please enter an institution code");

    const errorCallback = msg => error => console.log(`Error Encountered from ${msg}:`, error);
    const successCallback = msg => data => console.log(`Data Received from ${msg}:`, data);
    const ota = aegis.initializeOta(input);
    const institutionsResult = ota.getInstitutions(instCode);

    // Monadic Implementation
    institutionsResult.run().listen({
        onRejected: errorCallback('monad'),
        onResolved: successCallback('monad')
    });

    // Promise Implementation
    institutionsResult
    .run()
    .promise()
    .then(successCallback('promise'))
    .catch(errorCallback('promise'));
}