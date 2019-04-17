const doOtaStart = () => {
    const input = prompt("Please enter a JWT or PDV URL");
    const demoUsername = prompt("Please enter Demobank username");
    const demoPassword = prompt("Please enter Demobank password");

    const errorCallback = msg => error => console.log(`Error Encountered from ${msg}:`, error);
    const doneCallback = msg => data => console.log(`Data Received from ${msg}:`, data);
    const ota = aegis.ota(input);
    const institutionsResult = ota.start({
        "code": 1201,
        "prompts": [
            {
                "key": "Username",
                "value": demoUsername
            },
            {
                "key": "Password",
                "value": demoPassword
            }
        ]
    });

    // Monadic Implementation
    institutionsResult.subscribe(
        data => {
            if(data.status === "userInput") {
                const newPrompts = data.prompts.map(prmpt => ({
                    ...prmpt,
                    value: window.prompt(`Please enter ${prmpt.key}`)
                }));
                return { ...data, prompts: newPrompts };
            }
            return data
        },
        errorCallback('monad'),
        doneCallback('monad')
    );

    // Promise Implementation
    // N/A
}