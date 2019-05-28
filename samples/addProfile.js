const addProfile = async() => {    
    const input = prompt("Please enter a JWT or PDV URL");
    if(!input) return;
    
    const aegis = ewise_aegisJS({ jwt: input });
    const institutionsResult = aegis.getInstitutions();

    const data = await institutionsResult.run().promise();

    document.getElementById("viewPort").appendChild(
        document.createElement("br")
    );

    Array.prototype.map.call(data.content, category => {
        let sel = document.createElement("select");
        sel.id = category.name;

        let label = document.createElement("label");
        label.innerText = category.description;

        category.institutions.map(inst => {
            let opt = document.createElement("option");
            opt.value = inst.code;
            opt.innerText = inst.name;

            sel.appendChild(opt);
        });

        document.getElementById("viewPort").appendChild(label);
        document.getElementById("viewPort").appendChild(
            document.createElement("br")
        );
        document.getElementById("viewPort").appendChild(sel);
        document.getElementById("viewPort").appendChild(
            document.createElement("br")
        );

        let btn = document.createElement("button");
        btn.innerText = "Submit";
        btn.addEventListener("click", async () => {
            const instCode = sel.value;
            const y = aegis.getInstitutions(instCode);
            const prompts = await y.run().promise();            
            renderPromptsToScreenAddProfile(input, prompts);
        });
        document.getElementById("viewPort").appendChild(btn);

        document.getElementById("viewPort").appendChild(
            document.createElement("br")
        );
        document.getElementById("viewPort").appendChild(
            document.createElement("hr")
        );
    });
};

const renderPromptsToScreenAddProfile = (jwt, prompts) => {
    let instCodeLabel = document.createElement("span");
    instCodeLabel.innerText = `name: ${prompts.name} | code: ${prompts.code}`;

    Array.prototype.map.call(prompts.prompts, prompt => {
        const { key, label, type } = prompt;

        let inp = document.createElement("input");
        inp.id = key;
        inp.type = type;
        inp.className = "credentials";

        let lab = document.createElement("label");
        lab.innerText = label;
        lab.for = key;

        document.getElementById("viewPort").appendChild(lab);
        document.getElementById("viewPort").appendChild(inp);
        document.getElementById("viewPort").appendChild(
            document.createElement("br")
        );
    });

    let btn = document.createElement("button");
    btn.innerText = "Submit";
    btn.addEventListener("click", async () => {
        doOtaRunAggregationClosureAddProfile(
            jwt,
            prompts.code,
            Array.prototype.map.call(
                document.querySelectorAll("input.credentials"),
                inpt => {
                    return {
                        key: inpt.id,
                        value: inpt.value
                    }
                }
            )
        );        
        document.getElementById("viewPort").innerHTML = "";
    });
    document.getElementById("viewPort").appendChild(btn);
};

const doOtaRunAggregationClosureAddProfile = (jwt, instCode, prompts) => {
    const aegis = ewise_aegisJS({ jwt });    
    const otaControls = aegis.addProfile(instCode, prompts);

    // Make controls available to the console
    // Practice for dev/test only - don't do this in production
    window.stopOta = otaControls.stop;

    // Execute the stream
    const stream$ = otaControls.run();

    // Observable Implementation
    stream$.subscribe(data => {
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
};