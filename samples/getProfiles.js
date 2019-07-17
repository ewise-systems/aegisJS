const getProfiles = async() => {    
    const input = prompt("Please enter a JWT or PDV URL");
    if(!input) return;
    
    const aegis = ewise_aegisJS({ jwt: input });
    const profilesResult = aegis.getProfiles();

    const data = await profilesResult.run().promise();

    document.getElementById("viewPort").appendChild(
        document.createElement("br")
    );

    let sel = document.createElement("select");
    sel.id = "Profiles";

    let label = document.createElement("label");
    label.innerText = "Available Profiles";

    Array.prototype.map.call(data.content, profile => {
        let opt = document.createElement("option");
        opt.value = profile.profileId;
        opt.innerText = `${profile.ppid}: ${profile.instCode}`;

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
        const profileId = sel.value;
        const y = aegis.getProfiles({ profileId });
        const profile = await y.run().promise();
        renderProfileToScreen(aegis, profile);
    });
    document.getElementById("viewPort").appendChild(btn);

    document.getElementById("viewPort").appendChild(
        document.createElement("br")
    );
    document.getElementById("viewPort").appendChild(
        document.createElement("hr")
    );
};

const renderProfileToScreen = (aegis, { profileId, instCode }) => {
    const resultContainer = document.createElement("pre");
    resultContainer.id = "resultContainer";
    document.getElementById("viewPort").appendChild(resultContainer);

    let getCredsBtn = document.createElement("button");
    getCredsBtn.innerText = "Get Credentials";
    getCredsBtn.addEventListener("click", async () => {
        const y = aegis.getProfiles({ profileId, creds: true });
        const creds = await y.run().promise();
        document.getElementById("resultContainer").innerHTML = JSON.stringify(creds, null, 2);
    });
    document.getElementById("viewPort").appendChild(getCredsBtn);

    let getAccountsBtn = document.createElement("button");
    getAccountsBtn.innerText = "Get Accounts";
    getAccountsBtn.addEventListener("click", async () => {
        const y = aegis.getAccounts();
        const accounts = await y.run().promise();
        document.getElementById("resultContainer").innerHTML = JSON.stringify(accounts, null, 2);
    });
    document.getElementById("viewPort").appendChild(getAccountsBtn);

    let getTxnsBtn = document.createElement("button");
    getTxnsBtn.innerText = "Get Transactions";
    getTxnsBtn.addEventListener("click", async () => {
        const y = aegis.getTransactions();
        const txns = await y.run().promise();
        document.getElementById("resultContainer").innerHTML = JSON.stringify(txns, null, 2);
    });
    document.getElementById("viewPort").appendChild(getTxnsBtn);

    let updateProfilesBtn = document.createElement("button");
    updateProfilesBtn.innerText = "Update Profiles";
    updateProfilesBtn.addEventListener("click", async () => {
        // TODO: Subscribe to stream and render data/OTP to screen
        aegis.updateProfile({ profileId }).run().subscribe(
            console.log,
            console.warn,
            () => document.getElementById("resultContainer").innerHTML = "DONE"
        );
    });
    document.getElementById("viewPort").appendChild(updateProfilesBtn);

    let updateBasicProfilesBtn = document.createElement("button");
    updateBasicProfilesBtn.innerText = "Update Basic Profiles";
    updateBasicProfilesBtn.addEventListener("click", async () => {
        // TODO: Subscribe to stream and render data/OTP to screen
        aegis.updateBasicProfile({ profileId }).run().subscribe(
            console.log,
            console.warn,
            () => document.getElementById("resultContainer").innerHTML = "DONE"
        );
    });
    document.getElementById("viewPort").appendChild(updateBasicProfilesBtn);

    let deleteProfileBtn = document.createElement("button");
    deleteProfileBtn.innerText = "Delete Profile";
    deleteProfileBtn.addEventListener("click", async () => {
        const y = aegis.deleteProfile({ profileId });
        await y.run().promise();
        document.getElementById("viewPort").innerHTML = "";
    });
    document.getElementById("viewPort").appendChild(deleteProfileBtn);
};