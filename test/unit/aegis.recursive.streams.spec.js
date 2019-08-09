/*jshint expr: true*/

require("mocha");
require("chai/register-should");
const sinon = require("sinon");
const { compose } = require("ramda");
const { isObject } = require("lodash/fp");
const { of, rejected } = require("folktale/concurrency/task");

const aegis = require("../../src/aegis");

const PDVMethodsUnderTest = [
    "initializeOta",
    "addProfile",
    "addProfileAndLogin",
    "loginProfile",
    "addBasicProfile",
    "updateProfile",
    "updateBasicProfile"
];

const downloadMethodsUnderTest = [
    "downloadUpdates"
];

/*
    REPETITIVE MANUAL UNIT TESTING FOR STREAMS
*/

const runStreamUnitTestSuite = (doneStatus, ops = ["run", "resume", "stop"]) => aegis => ({
    onMethods: (...methods) =>
        methods.forEach(method => {
            describe(`when ${method} is called`, () => {
                const task = of({status:"running"});
                const dataTask = of({status:"running",data:{}});
                const doneTask = of({status: doneStatus});
                const rejectedTask = rejected({status: 500});

                it("should not execute AJAX if it is only instantiated, with none of its methods invoked", done => {
                    const ajaxTaskFn = sinon.stub();
                    aegis[method]({ ajaxTaskFn });
                    setTimeout(() => {
                        ajaxTaskFn.called.should.be.false;
                        done();
                    }, 30);
                });

                it("should return an object when it is instantiated", () => {
                    const ajaxTaskFn = sinon.stub();
                    const result = aegis[method]({ ajaxTaskFn });
                    isObject(result).should.be.true;
                });

                it("should return an object when it is instantiated without an AJAX function", () => {
                    const result = aegis[method]();
                    isObject(result).should.be.true;
                });

                it("should return an object with a 'run' property", () => {
                    const ajaxTaskFn = sinon.stub();
                    const result = aegis[method]({ ajaxTaskFn });
                    const keys = Object.keys(result);
                    keys.should.include("run");
                });

                it("should return an object with a 'resume' property", () => {
                    const ajaxTaskFn = sinon.stub();
                    const result = aegis[method]({ ajaxTaskFn });
                    const keys = Object.keys(result);
                    keys.should.include("resume");
                });

                it("should return an object with a 'stop' property", () => {
                    const ajaxTaskFn = sinon.stub();
                    const result = aegis[method]({ ajaxTaskFn });
                    const keys = Object.keys(result);
                    keys.should.include("stop");
                });

                it("should execute AJAX when its 'run' method is called", async () => {
                    const ajaxTaskFn = sinon.stub().returns(task)
                        .onSecondCall().returns(doneTask);
                    await aegis[method]({ ajaxTaskFn, pollingInterval: 0 }).run().toPromise();
                    ajaxTaskFn.called.should.be.true;
                });

                it("should execute AJAX 10 times given it generates a terminal signal on its 9th event", async () => {
                    const ajaxTaskFn = sinon.stub().returns(task)
                        .onCall(4).returns(dataTask)
                        .onCall(8).returns(doneTask);
                    await aegis[method]({ ajaxTaskFn, pollingInterval: 0 }).run().toPromise();
                    ajaxTaskFn.callCount.should.equal(10);
                });

                it("should invoke its subscriber 5 times given it generates four nonrepeating events and a default", async () => {
                    const ajaxTaskFn = sinon.stub().returns(task)
                        .onCall(4).returns(dataTask)
                        .onCall(8).returns(doneTask);
                    const subscriber = sinon.stub();
                    const x$ = aegis[method]({ ajaxTaskFn, pollingInterval: 0 }).run();
                    x$.subscribe(subscriber);
                    await x$.toPromise();
                    subscriber.callCount.should.equal(5);
                });

                it("should invoke the error subscriber when the AJAX rejects", async () => {
                    const ajaxTaskFn = sinon.stub()
                        .onFirstCall().returns(task)
                        .returns(rejectedTask);
                    const subscriber = sinon.stub();
                    const x$ = aegis[method]({ ajaxTaskFn }).run();
                    x$.subscribe({ error: subscriber });
                    try { await x$.toPromise(); } catch(e) {}
                    subscriber.called.should.be.true;
                });

                it("should invoke the error subscriber exactly once when the AJAX rejects", async () => {
                    const ajaxTaskFn = sinon.stub()
                        .onFirstCall().returns(task)
                        .returns(rejectedTask);
                    const subscriber = sinon.stub();
                    const x$ = aegis[method]({ ajaxTaskFn }).run();
                    x$.subscribe({ error: subscriber });
                    try { await x$.toPromise(); } catch(e) {}
                    subscriber.callCount.should.equal(1);
                });

                it("should invoke the complete subscriber when the stream finishes", async () => {
                    const ajaxTaskFn = sinon.stub().returns(task)
                        .onCall(4).returns(dataTask)
                        .onCall(8).returns(doneTask);
                    const subscriber = sinon.stub();
                    const x$ = aegis[method]({ ajaxTaskFn, pollingInterval: 0 }).run();
                    x$.subscribe({ complete: subscriber });
                    await x$.toPromise();
                    subscriber.called.should.be.true;
                });

                it("should invoke the complete subscriber exactly once when the stream finishes", async () => {
                    const ajaxTaskFn = sinon.stub().returns(task)
                        .onCall(4).returns(dataTask)
                        .onCall(8).returns(doneTask);
                    const subscriber = sinon.stub();
                    const x$ = aegis[method]({ ajaxTaskFn, pollingInterval: 0 }).run();
                    x$.subscribe({ complete: subscriber });
                    await x$.toPromise();
                    subscriber.callCount.should.equal(1);
                });

                it("should execute AJAX if it calls its 'stop' method", async () => {
                    const ajaxTaskFn = sinon.stub();
                    aegis[method]({ ajaxTaskFn }).stop();
                    ajaxTaskFn.called.should.be.true;
                });

                it("should execute AJAX exactly once if its 'stop' method is called", async () => {
                    const ajaxTaskFn = sinon.stub();
                    aegis[method]({ ajaxTaskFn }).stop();
                    ajaxTaskFn.callCount.should.equal(1);
                });

                it("should return a task when its 'stop' method is called", async () => {
                    const ajaxTaskFn = sinon.stub().returns(task);
                    const result = aegis[method]({ ajaxTaskFn }).stop();
                    result.should.equal(task);
                });

                if(ops.indexOf("resume") === -1) return;

                it("should execute AJAX if it calls its 'resume' method", async () => {
                    const ajaxTaskFn = sinon.stub();
                    aegis[method]({ ajaxTaskFn }).resume({});
                    ajaxTaskFn.called.should.be.true;
                });

                it("should execute AJAX exactly once if its 'resume' method is called", async () => {
                    const ajaxTaskFn = sinon.stub();
                    aegis[method]({ ajaxTaskFn }).resume({});
                    ajaxTaskFn.callCount.should.equal(1);
                });

                it("should return a task when its 'resume' method is called", async () => {
                    const ajaxTaskFn = sinon.stub().returns(task);
                    const result = aegis[method]({ ajaxTaskFn }).resume({});
                    result.should.equal(task);
                });
            });
        })
});

const runPDVStreamUnitTestSuiteOnAegis = compose(runStreamUnitTestSuite("done"), aegis);
runPDVStreamUnitTestSuiteOnAegis().onMethods(...PDVMethodsUnderTest);

const runDownloadStreamUnitTestSuiteOnAegis = compose(runStreamUnitTestSuite("READY", ["run", "stop"]), aegis);
runDownloadStreamUnitTestSuiteOnAegis().onMethods(...downloadMethodsUnderTest);

/*
    MANUAL UNIT TESTING
*/

describe("when updateProfile is called with a body", () => {
    it("should return an object when it is instantiated without an AJAX function", () => {
        const result = aegis().updateProfile({ instCode: 1, prompts: 1 });
        isObject(result).should.be.true;
    });
});

describe("when updateBasicProfile is called with a body", () => {
    it("should return an object when it is instantiated without an AJAX function", () => {
        const result = aegis().updateBasicProfile({ instCode: 1, prompts: 1 });
        isObject(result).should.be.true;
    });
});