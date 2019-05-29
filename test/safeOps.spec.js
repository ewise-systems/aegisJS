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
        argsCount = 1,
        types: {
            inp : inputType = String,
            out: outputType
        }
    } = args;

    const assertPropertyArgs = new Array(argsCount).fill(fc.anything());
    const fcAssertProperty = fn => compose(fc.assert, fc.property)(...assertPropertyArgs, fn);
    // const x = (desc, fn) => it(desc, () => fcAssertProperty(fn));

    describe(`when ${cut.name} is called`, () => {
        it("should be a function", () => {
            cut.should.be.a("function");
        });
        
        it("should create Result for any input", () => {
            fcAssertProperty((...input) => {
                Result.hasInstance(cut(...input)).should.be.true;
            });
        });

        if(outputType) {
            it(`should create Result that holds ${outputType.name} for any ${inputType.name}`, () => {
                fcAssertProperty((...input) => {
                    if(input.reduce((acc, i) => i instanceof inputType && acc, true))
                        cut(...input).getOrElse(null).should.be.an.instanceof(outputType);
                });
            });
        }

        it(`should create Result that holds null for any non-${inputType.name}`, () => {
            fcAssertProperty((...input) => {
                if(input.reduce((acc, i) => i instanceof inputType && acc, true))
                    expect(cut(...input).getOrElse(null)).to.be.null;
            });
        });

        it("should not throw when not fed an argument", () => {
            cut.should.not.throw();
        });

        it("should not throw for any argument", () => {
            fcAssertProperty((...input) => {
                expect(() => cut(...input)).to.not.throw();
            });
        });
    });
};

runSafeOpsTestSuite({ cut: safeSplit, types: { out: Array } });
runSafeOpsTestSuite({ cut: safeNth, types: { inp: Number } });
runSafeOpsTestSuite({ cut: safeBase64ToBuffer, types: { out: Array } });
runSafeOpsTestSuite({ cut: safeJsonParse, types: { out: Object } });
runSafeOpsTestSuite({ cut: safeIsWebUri, types: { out: Boolean } });
runSafeOpsTestSuite({ cut: safeMakeWebUrl, argsCount: 2, types: { out: String } });
runSafeOpsTestSuite({ cut: safeGetAegisUrl, types: { out: String } });