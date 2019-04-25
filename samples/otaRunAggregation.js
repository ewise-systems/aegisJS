const doOtaRunAggregation = () => {
    const input = prompt("Please enter a JWT or PDV URL");
    const demoUsername = prompt("Please enter Demobank username");
    const demoPassword = prompt("Please enter Demobank password");

    const ota = aegis.initializeOta(input);
    const otaControls = ota.start({
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

    // Make controls available to the console
    // Practice for dev/test only - don't do this in production
    window.stopOta = otaControls.stop;

    // Observable Implementation
    otaControls.stream$.subscribe(data => {
        let viewPort = document.querySelector("#viewPort");

        // Handle OTP here
        if(data.status === "userInput") {
            let otpBox = document.createElement("section");
            otpBox.id = "otpBox";

            let submit = document.createElement("button");
            submit.id = "submit";
            submit.innerText = "Submit credentials";

            submit.addEventListener("click", () => {
                const prompts = Array.prototype.map.call(
                    document.querySelectorAll("input"),
                    el => {
                        return {
                            key: el.id,
                            value: el.value
                        }
                    }
                );
                otaControls.resume({prompts}).run();
            });

            otpBox.appendChild(submit);
            otpBox.appendChild(
                document.createElement("br")
            );

            Array.prototype.map.call(data.prompts, prompt => {
                let { label, input, image } = ((type, label, b64) => {
                    let l, i, h;
                    switch(type) {
                        case "input":
                            l = document.createElement("label");
                            l.innerText = label;

                            i = document.createElement("input");
                        break;
                        case "password":
                            l = document.createElement("label");
                            l.innerText = label;

                            i = document.createElement("input");
                            i.type = "password";
                        break;
                        case "image":
                            l = document.createElement("label");
                            l.innerText = label;

                            h = document.createElement("img");
                            h.src = `data:image/jpeg;base64,${b64}`;

                            i = document.createElement("input");
                        break;
                    }
                    return { label: l, input: i, image: h };
                })(prompt.type, prompt.label, prompt.base64Image);

                input.id = prompt.key;
                label.for = prompt.key;

                otpBox.appendChild(label);
                otpBox.appendChild(
                    document.createElement("br")
                );

                if(image) {
                    otpBox.appendChild(image);
                    otpBox.appendChild(
                        document.createElement("br")
                    );
                }

                otpBox.appendChild(input);
                otpBox.appendChild(
                    document.createElement("br")
                );
            });

            viewPort.insertBefore(otpBox, viewPort.childNodes[0]);
        }

        // Render data to DOM
        Object.keys(data)
            .map(key => {
                let el = document.createElement("div");
                el.innerText = `${key}: ${JSON.stringify(data[key])}`;
                viewPort.appendChild(el);
                viewPort.appendChild(
                    document.createElement("br")
                );
            });
        viewPort.appendChild(
            document.createElement("hr")
        );
    });

    // Promise Implementation
    // N/A
}