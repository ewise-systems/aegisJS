const doOtaRunAggregationClosure = (jwt, instCode, prompts) => {
    const aegis = ewise_aegisJS({ jwt });
    const otaControls = aegis.initializeOta(instCode, prompts);

    // Make controls available to the console
    // Practice for dev/test only - don't do this in production
    window.stopOta = otaControls.stop;

    // Execute the stream
    const stream$ = otaControls.run();

    // Observable Implementation
    stream$.subscribe(data => {
        let viewPort = document.querySelector("#viewPort");

        // Handle OTP here
        if(data && data.status === "userInput") {
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
                )
                .concat(
                    Array.prototype.map.call(
                        document.querySelectorAll("select"),
                        el => {
                            return {
                                key: el.id,
                                value: el.value
                            }
                        }
                    )
                );
                otaControls.resume({prompts}).run();
                otpBox.parentNode.removeChild(otpBox);
            });

            otpBox.appendChild(submit);
            otpBox.appendChild(
                document.createElement("br")
            );

            Array.prototype.map.call(data.prompts, prompt => {
                let { label, input, image } = ((type, label, b64, opts) => {
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
                        case "lov":
                            i = document.createElement("select");
                            i.innerText = label;

                            Array.prototype.map.call(opts, opt => {
                                let choice = document.createElement("option");
                                choice.value = opt.key;
                                choice.innerText = opt.label;

                                i.appendChild(choice);
                            });
                        break;
                    }
                    return { label: l, input: i, image: h };
                })(prompt.type, prompt.label, prompt.base64Image, prompt.options);

                input.id = prompt.key;

                if(label) {
                    label.for = prompt.key;
                    otpBox.appendChild(label);
                    otpBox.appendChild(
                        document.createElement("br")
                    );
                }

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