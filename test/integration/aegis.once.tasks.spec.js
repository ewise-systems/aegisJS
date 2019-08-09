/*jshint expr: true*/

require("mocha");
require("chai/register-should");

const aegis = require("../../src/aegis");
const {
    impostorPort200,
    impostorPort500,
    jwt200,
    jwt500,
    payload200,
    payload500
} = require("./helper");

const methodsUnderTest = [
    "getDetails",
    "registerUser",
    "checkForUpdates",
    "applyUpdates",
    "getInstitutions",
    "getInstitutionsOta",
    "deleteProfile",
    "getProfiles",
    "getAccounts",
    "deleteAccount",
    "getTransactions",
    "deleteTransaction"
];

const runIntTestSuite = aegis => ({
    onMethods: (...methods) =>
        methods.forEach(method => {
            describe(`when ${method} is called`, () => {
                it("should get a response when the jwt is initialized in the aegis declaration", async () => {
                    const result = await aegis({ jwt: jwt200 })[method]().run().promise();
                    result.should.deep.equal(payload200);
                });

                it("should get a response when the jwt is passed directly to the method", async () => {
                    const result = await aegis()[method]({ jwtOrUrl: jwt200, jwt: jwt200 }).run().promise();
                    result.should.deep.equal(payload200);
                });

                it("should catch a failed request", done => {
                    aegis({ jwt: jwt500 })[method]().run().listen({
                        onResolved: _ => done(Error("The code reached an invalid place.")),
                        onRejected: error => error.data.should.deep.equal(payload500) && done()
                    });
                });
            });
        })
});

runIntTestSuite(aegis).onMethods(...methodsUnderTest);

/*
    MANUAL INTEGRATION TESTING
*/
describe("when loginUser is called", () => {
    it("should get a response when the jwt is passed directly to the method", async () => {
        const result = await aegis().loginUser({ url: `http://127.0.0.1:${impostorPort200}` }).run().promise();
        result.should.deep.equal(payload200);
    });

    it("should catch a failed request", done => {
        aegis().loginUser({ url: `http://127.0.0.1:${impostorPort500}` }).run().listen({
            onResolved: _ => done(Error("The code reached an invalid place.")),
            onRejected: _ => done()
        });
    });
});