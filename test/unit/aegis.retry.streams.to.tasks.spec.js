/*jshint expr: true*/

require("mocha");
require("chai/register-should");
const sinon = require("sinon");
const { compose } = require("ramda");
const { of, rejected } = require("folktale/concurrency/task");

const aegis = require("../../src/aegis");

const methodsUnderTest = [
    "hasStarted",
    "waitForUpdates"
];

/*
    REPETITIVE MANUAL UNIT TESTING FOR STREAMS TRANSFORMED TO TASKS
    These functions return tasks that hide observables.
    These observables end on their first success, and retries on all failures.
*/

const runStreamToTaskUnitTestSuite = aegis => ({
    onMethods: (...methods) =>
        methods.forEach(method => {
            describe(`when ${method} is called`, () => {

                // test constants
                const task = of({status:"running"});
                const rejectedTask = rejected(500);

                it("should not execute AJAX if it is not explicitly run", done => {
                    const ajaxTaskFn = sinon.stub().returns(task);
                    aegis[method]({ ajaxTaskFn, pollingInterval: 1, retryDelay: 0 });
                    setTimeout(() => {
                        ajaxTaskFn.called.should.be.false;
                        done();
                    }, 30);
                });

                it("should execute AJAX when the task is explicitly run", async () => {
                    const ajaxTaskFn = sinon.stub()
                        .returns(rejectedTask)
                        .onThirdCall().returns(task);
                    await aegis[method]({ ajaxTaskFn, pollingInterval: 1, retryDelay: 0 }).run().promise();
                    ajaxTaskFn.called.should.be.true;
                });

                it("should execute AJAX three times when the stream gets a failed signal the first two times and succeeds the third time", async () => {
                    const ajaxTaskFn = sinon.stub()
                        .returns(rejectedTask)
                        .onThirdCall().returns(task);
                    await aegis[method]({ ajaxTaskFn, pollingInterval: 1, retryDelay: 0 }).run().promise();
                    ajaxTaskFn.callCount.should.equal(3);
                });

                it("should execute the rejected listener when the retry limit is reached", async () => {
                    const resolvedListener = sinon.stub();
                    const rejectedListener = sinon.stub();
                    const ajaxTaskFn = sinon.stub().returns(rejectedTask);
                    const t = aegis[method]({ ajaxTaskFn, pollingInterval: 1, retryDelay: 0, retryLimit: 0 }).run();
                    t.listen({
                        onResolved: resolvedListener,
                        onRejected: rejectedListener
                    });
                    try { await t.promise(); } catch(e) {}
                    rejectedListener.called.should.be.true;
                });

                it("should execute the rejected listener exactly once when the retry limit is reached", async () => {
                    const resolvedListener = sinon.stub();
                    const rejectedListener = sinon.stub();
                    const ajaxTaskFn = sinon.stub().returns(rejectedTask);
                    const t = aegis[method]({ ajaxTaskFn, pollingInterval: 1, retryDelay: 0, retryLimit: 0 }).run();
                    t.listen({
                        onResolved: resolvedListener,
                        onRejected: rejectedListener
                    });
                    try { await t.promise(); } catch(e) {}
                    rejectedListener.callCount.should.equal(1);
                });

                it("should not execute the resolved listener when the retry limit is reached", async () => {
                    const resolvedListener = sinon.stub();
                    const rejectedListener = sinon.stub();
                    const ajaxTaskFn = sinon.stub().returns(rejectedTask);
                    const t = aegis[method]({ ajaxTaskFn, pollingInterval: 1, retryDelay: 0, retryLimit: 0 }).run();
                    t.listen({
                        onResolved: resolvedListener,
                        onRejected: rejectedListener
                    });
                    try { await t.promise(); } catch(e) {}
                    resolvedListener.called.should.be.false;
                });

                it("should execute the resolved listener upon a success", async () => {
                    const resolvedListener = sinon.stub();
                    const rejectedListener = sinon.stub();
                    const ajaxTaskFn = sinon.stub().returns(task);
                    const t = aegis[method]({ ajaxTaskFn, pollingInterval: 1, retryDelay: 0 }).run();
                    t.listen({
                        onResolved: resolvedListener,
                        onRejected: rejectedListener
                    });
                    try { await t.promise(); } catch(e) {}
                    resolvedListener.called.should.be.true;
                });

                it("should execute the resolved listener exactly once upon a success", async () => {
                    const resolvedListener = sinon.stub();
                    const rejectedListener = sinon.stub();
                    const ajaxTaskFn = sinon.stub().returns(task);
                    const t = aegis[method]({ ajaxTaskFn, pollingInterval: 1, retryDelay: 0 }).run();
                    t.listen({
                        onResolved: resolvedListener,
                        onRejected: rejectedListener
                    });
                    try { await t.promise(); } catch(e) {}
                    resolvedListener.callCount.should.equal(1);
                });

                it("should not execute the rejected listener upon a success", async () => {
                    const resolvedListener = sinon.stub();
                    const rejectedListener = sinon.stub();
                    const ajaxTaskFn = sinon.stub().returns(task);
                    const t = aegis[method]({ ajaxTaskFn, pollingInterval: 1, retryDelay: 0 }).run();
                    t.listen({
                        onResolved: resolvedListener,
                        onRejected: rejectedListener
                    });
                    try { await t.promise(); } catch(e) {}
                    rejectedListener.called.should.be.false;
                });

                it("should return a task by default", () => {
                    const result = aegis[method]();
                    result.should.have.property("_computation");
                });
            });
        })

});

const runStreamToTaskUnitTestSuiteOnAegis = compose(runStreamToTaskUnitTestSuite, aegis);
runStreamToTaskUnitTestSuiteOnAegis().onMethods(...methodsUnderTest);