const getProcesses = async() => {    
    const input = prompt("Please enter a JWT or PDV URL");
    if(!input) return;
    
    const aegis = ewise_aegisJS({ jwt: input });
    const processesResult = aegis.getProcesses({status:'error'});

    const data = await processesResult.run({}).promise();

    document.getElementById("viewPort").appendChild(
        document.createElement("br")
    );

    let sel = document.createElement("select");
    sel.id = "Processes";

    let label = document.createElement("label");
    label.innerText = "Available Processes";

    Array.prototype.map.call(data.content, process => {
        let opt = document.createElement("option");
        opt.value = process.processId;
        opt.innerText = `${process.processId}: ${process.status}`;

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

    document.getElementById("viewPort").appendChild(
        document.createElement("br")
    );
    document.getElementById("viewPort").appendChild(
        document.createElement("hr")
    );
};