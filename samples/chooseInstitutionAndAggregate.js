const chooseInstitutionAndAggregate = async () => {
    const input = prompt("Please enter a JWT or PDV URL");
    if(!input) return;

    const ota = aegis.initializeOta(input);
    const x = ota.getInstitutions();

    const data = await x.run().promise();

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
            const y = ota.getInstitutions(instCode);
            const prompts = await y.run().promise();

            renderPromptsToScreen(input, prompts);
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

const renderPromptsToScreen = (jwt, prompts) => {
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
        doOtaRunAggregationClosure(jwt, {
            code: prompts.code,
            prompts: Array.prototype.map.call(
                document.querySelectorAll("input.credentials"),
                inpt => {
                    return {
                        key: inpt.id,
                        value: inpt.value
                    }
                }
            )
        });

        document.getElementById("viewPort").innerHTML = "";
    });
    document.getElementById("viewPort").appendChild(btn);
};