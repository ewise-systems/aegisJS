// /*jshint expr: true*/

// require("mocha");
// require("chai/register-should");
// const Result = require("folktale/result");
// const fc = require('fast-check');
// const { expect } = require("chai");
// const { safeSplit } = require("../../lib/fpcore/safeOps");
// const { compose } = require("ramda");

// const fcAssertProperty = compose(fc.assert, fc.property);

// describe("when safeSplit is called", () => {
//     it("should be a function", () => {
//         safeSplit.should.be.a("function");
//     });

//     it("should create Result for any input", () => {
//         fcAssertProperty(fc.anything(), input => {
//             Result.hasInstance(safeSplit(input)).should.be.true;
//         });
//     });

//     it("should create Result that holds an array for any string", () => {
//         fcAssertProperty(fc.string(), input => {
//             safeSplit(input).getOrElse(null).should.be.an.instanceof(Array);
//         });
//     });

//     it("should create Result that holds null for any non-string", () => {
//         fcAssertProperty(fc.anything(), input => {
//             if(typeof input !== 'string')
//                 expect(safeSplit(input).getOrElse(null)).to.be.null;
//         });
//     });

//     it("should not throw when not fed an argument", () => {
//         safeSplit.should.not.throw();
//     });

//     it("should not throw for any argument", () => {
//         fcAssertProperty(fc.anything(), input => {
//             expect(() => safeSplit(input)).to.not.throw();
//         });
//     });
// });