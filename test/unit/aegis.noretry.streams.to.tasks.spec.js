/*jshint expr: true*/

require("mocha");
require("chai/register-should");
const sinon = require("sinon");
const { compose } = require("ramda");
const { of, rejected } = require("folktale/concurrency/task");

const aegis = require("../../src/aegis");

const methodsUnderTest = [
    "hasStopped"
];

/*
    REPETITIVE MANUAL UNIT TESTING FOR STREAMS TRANSFORMED TO TASKS
    These functions return tasks that hide observables.
    These observables end only on their first failure.
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
                    aegis[method]({ ajaxTaskFn, pollingInterval: 1 });
                    setTimeout(() => {
                        ajaxTaskFn.called.should.be.false;
                        done();
                    }, 30);
                });

                it("should execute AJAX when the task is explicitly run", async () => {
                    const ajaxTaskFn = sinon.stub()
                        .returns(rejectedTask)
                        .onThirdCall().returns(task);
                    await aegis[method]({ ajaxTaskFn, pollingInterval: 1 }).run().promise();
                    ajaxTaskFn.called.should.be.true;
                });

                it("should execute AJAX three times when the stream gets a successful signal the first two times and fails the third time", async () => {
                    const ajaxTaskFn = sinon.stub()
                        .returns(task)
                        .onThirdCall().returns(rejectedTask);
                    await aegis[method]({ ajaxTaskFn, pollingInterval: 1 }).run().promise();
                    ajaxTaskFn.callCount.should.equal(3);
                });

                it("should never execute the rejected listener, even on a failed task", async () => {
                    const resolvedListener = sinon.stub();
                    const rejectedListener = sinon.stub();
                    const ajaxTaskFn = sinon.stub().returns(rejectedTask);
                    const t = aegis[method]({ ajaxTaskFn, pollingInterval: 1 }).run();
                    t.listen({
                        onResolved: resolvedListener,
                        onRejected: rejectedListener
                    });
                    try { await t.promise(); } catch(e) {}
                    rejectedListener.called.should.be.false;
                });

                it("should execute the resolved listener on a failed task", async () => {
                    const resolvedListener = sinon.stub();
                    const rejectedListener = sinon.stub();
                    const ajaxTaskFn = sinon.stub().returns(rejectedTask);
                    const t = aegis[method]({ ajaxTaskFn, pollingInterval: 1 }).run();
                    t.listen({
                        onResolved: resolvedListener,
                        onRejected: rejectedListener
                    });
                    try { await t.promise(); } catch(e) {}
                    resolvedListener.called.should.be.true;
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