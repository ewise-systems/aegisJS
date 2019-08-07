/*jshint expr: true*/

require("mocha");
require("chai/register-should");
const sinon = require("sinon");
const { compose } = require("ramda");
const { of } = require("folktale/concurrency/task");

const aegis = require("../../src/aegis");

const methodsUnderTest = [
    "getDetails",
    "checkForUpdates",
    "applyUpdates",
    "runBrowser",
    "getInstitutions",
    "deleteProfile",
    "getProfiles",
    "getAccounts",
    "deleteAccount",
    "getTransactions",
    "deleteTransaction"
];

/*
    REPETITIVE MANUAL UNIT TESTING FOR TASKS
*/

const runUnitTestSuite = aegis => ({
    onMethods: (...methods) => 
        methods.forEach(method => {
            describe(`when ${method} is called`, () => {

                // test constants
                const task = of(1);
            
                it("should return a task", () => {
                    const ajaxTaskFn = sinon.stub().returns(task);
                    const result = aegis[method]({ ajaxTaskFn });
                    result.should.equal(task);
                });
            
                it("should execute the stub function when the task is explicitly run", () => {
                    const ajaxTaskFn = sinon.stub().returns(task);
                    aegis[method]({ ajaxTaskFn }).run();
                    ajaxTaskFn.called.should.be.true;
                });
            
                it("should execute the stub function exactly once", () => {
                    const ajaxTaskFn = sinon.stub().returns(task);
                    aegis[method]({ ajaxTaskFn }).run();
                    ajaxTaskFn.callCount.should.equal(1);
                });

                it("should fail when there is no given jwt", done => {
                    aegis[method]().run().listen({
                        onResolved: _ => done(Error("Code has reached an invalid place")),
                        onRejected: err => err.should.equal("JWT was not provided.") && done(),
                    });
                });

                it("should fail when jwt body is malformed", done => {
                    const malformed = "header.s.signature";
                    aegis[method]({ jwt: malformed, jwtOrUrl: malformed }).run().listen({
                        onResolved: _ => done(Error("Code has reached an invalid place")),
                        onRejected: err => err.should.equal("JWT is invalid. Check the schema or aegis url.") && done(),
                    });
                });
            });
    })
});

const runUnitTestSuiteOnAegis = compose(runUnitTestSuite, aegis);
runUnitTestSuiteOnAegis().onMethods(...methodsUnderTest);