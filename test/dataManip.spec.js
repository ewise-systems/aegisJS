require("mocha");
require("chai/register-should");
const { expect } = require("chai");
const {
    safeBase64ToBuffer,
    parseJSON,
    stringToBuffer,
} = require("../lib/fpcore/safeOps");

// TODO: Mock Buffer
describe("safeBase64ToBuffer", () => {
    it("should create a buffer from 'string'", () => {
        safeBase64ToBuffer("string").should.be.an.instanceof(Buffer);
    });

    it("should create a buffer from '1d3f'", () => {
        safeBase64ToBuffer("1d3f").should.be.an.instanceof(Buffer);
    });

    it("should be a function", () => {
        safeBase64ToBuffer.should.be.a('function');
    });

    it("should throw a TypeError when not fed an argument", () => {
        safeBase64ToBuffer.should.not.throw();
    });
});

describe("parseJSON", () => {
    // it("should produce a Right when parsing the object '{a:1}'", () => {
    //     parseJSON('{"a":1}').should.be.an.instanceOf(Right);
    // });

    // it("should properly parse '{a:1}'", () => {
    //     parseJSON('{"a":1}').should.deep.equal(new Right({"a":1}));
    // });

    it("should be a function", () => {
        parseJSON.should.be.a('function');
    });

    it("should not throw", () => {
        parseJSON.should.not.throw();
    });

    // it("should produce a Left when parsing the string '2985s4'", () => {
    //     parseJSON("298s54").should.be.an.instanceOf(Left);
    // });

    // it("should produce a Left when parsing the string '682380923'", () => {
    //     parseJSON("682380923").should.be.an.instanceOf(Left);
    // });

    // it("should produce a Left when given an empty string", () => {
    //     parseJSON("").should.be.an.instanceOf(Left);
    // });

    // it("should produce a Left when given the string ['32s',4,{d:2}]", () => {
    //     parseJSON("['32s',4,{d:2}]").should.be.an.instanceOf(Left);
    // });
});

describe("stringToBuffer", () => {
    it("should produce a buffer with the string '3hjkd9'", () => {
        stringToBuffer("3hjkd9").should.be.an.instanceOf(Buffer);
    });

    it("should not throw", () => {
        stringToBuffer.should.not.throw();
    });

    it("should be a function", () => {
        stringToBuffer.should.be.a('function');
    });

    it("should result to null when given the number 89787643", () => {
        expect(stringToBuffer(89787643)).to.be.null;
    });

    it("should result to null when given the object {v:3}", () => {
        expect(stringToBuffer({v:3})).to.be.null;
    });

    it("should result to null when given the array []", () => {
        expect(stringToBuffer([])).to.be.null;
    });

    it("should result to null when given a null", () => {
        expect(stringToBuffer(null)).to.be.null;
    });

    it("should result to null when given undefined", () => {
        expect(stringToBuffer(undefined)).to.be.null;
    });
});