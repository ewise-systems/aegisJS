/*jshint expr: true*/

require("mocha");
require("chai/register-should");
const Result = require("folktale/result");
const fc = require('fast-check');
const { expect } = require("chai");
const {
    safeSplit,
    safeNth,
    safeBase64ToBuffer,
    safeJsonParse,
    safeIsWebUri,
    safeMakeWebUrl,
    safeGetAegisUrl
} = require("../lib/fpcore/safeOps");
const { compose } = require("ramda");

const runSafeOpsTestSuite = args => {
    const {
        cut,
        name,
        argsCount = 1,
        types: {
            inp : inputType = String,
            out: outputType
        } = {}
    } = args;

    const checkType = (sub, type) => typeof sub === type.name.toLowerCase() || sub instanceof type;
    const assertPropertyArgs = new Array(argsCount).fill(fc.anything());
    const fcAssertProperty = (args, fn) => compose(fc.assert, fc.property)(...args, fn);
    fc.it = (desc, fn) => it(desc, () => fcAssertProperty(assertPropertyArgs, fn));

    describe(`when ${name || cut.name} is called`, () => {
        it("should be a function", () => {
            cut.should.be.a("function");
        });
        
        fc.it("should create Result for any input", (...input) => {
            Result.hasInstance(cut(...input)).should.be.true;
        });

        outputType &&
        fc.it(`should create Result that holds ${outputType.name} for any ${inputType.name}`, (...input) => {
            if(input.reduce((acc, i) => checkType(i, inputType) && acc, true))
                cut(...input).getOrElse(null).should.be.an.instanceof(outputType);
        });

        fc.it(`should create Result that holds null for any non-${inputType.name}`, (...input) => {
            if(!input.reduce((acc, i) => checkType(i, inputType) && acc, true))
                expect(cut(...input).getOrElse(null)).to.be.null;
        });

        it("should not throw when not fed an argument", () => {
            cut.should.not.throw();
        });

        fc.it("should not throw for any argument", (...input) => {
            expect(() => cut(...input)).to.not.throw();
        });
    });
};

runSafeOpsTestSuite({ cut: safeSplit, types: { out: Array } });
runSafeOpsTestSuite({ cut: safeNth, types: { inp: Array } });
runSafeOpsTestSuite({ cut: safeBase64ToBuffer, types: { out: Buffer } });
runSafeOpsTestSuite({ cut: safeJsonParse });
runSafeOpsTestSuite({ cut: safeIsWebUri });
runSafeOpsTestSuite({ cut: safeMakeWebUrl, name: 'safeMakeWebUrl', argsCount: 2 });
runSafeOpsTestSuite({ cut: safeGetAegisUrl });