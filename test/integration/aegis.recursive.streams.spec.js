/*jshint expr: true*/

require("mocha");
require("chai/register-should");

const aegis = require("../../src/aegis");

const { jwt200, jwt500, payload500 } = require("./helper");

const PDVMethodsUnderTest = [
    "initializeOta",
    "addProfile",
    "addProfileAndLogin",
    "loginProfile",
    "addBasicProfile",
    "updateProfile",
    "updateBasicProfile"
];

// const downloadMethodsUnderTest = [
//     "downloadUpdates"
// ];

const runIntTestSuite = aegis => ({
    onMethods: (...methods) =>
        methods.forEach(method => {
            describe(`when ${method} is called`, () => {
                it("should complete when a successful terminal state is passed", done => {
                    aegis({ jwt: jwt200 })[method]().run().subscribe({
                        error: _ => done(Error("The code reached an invalid place.")),
                        complete: _ => done(),
                    });
                });

                it("should fail when a failed terminal state is passed", done => {
                    aegis({ jwt: jwt500 })[method]().run().subscribe({
                        error: error => error.data.should.deep.equal(payload500) && done(),
                        complete: _ => done(Error("The code reached an invalid place.")),
                    });
                });
            });
        })
});

runIntTestSuite(aegis).onMethods(...PDVMethodsUnderTest);