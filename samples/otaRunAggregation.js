const doOtaRunAggregation = () => {
    const input = prompt("Please enter a JWT or PDV URL");
    const demoUsername = prompt("Please enter Demobank username");
    const demoPassword = prompt("Please enter Demobank password");

    doOtaRunAggregationClosure(input, 1201, [
        {
            "key": "Username",
            "value": demoUsername
        },
        {
            "key": "Password",
            "value": demoPassword
        }
    ]);
}