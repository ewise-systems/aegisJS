/*jshint expr: true*/

require("mocha");
require("chai/register-should");

const aegis = require("../../src/aegis");

const { url: jwtOrUrl } = require("./integration-helper");

describe("when getDetails is called", () => {
    it("should get a response", async () => {
        const result = await aegis().getDetails({ jwtOrUrl }).run().promise();
        result.should.not.be.undefined;
    });

    it("should get the aegis version details", async () => {
        const result = await aegis().getDetails({ jwtOrUrl }).run().promise();
        result.aegis.should.not.be.undefined;
    });

    it("should get the engine version details", async () => {
        const result = await aegis().getDetails({ jwtOrUrl }).run().promise();
        result.engine.should.not.be.undefined;
    });
});