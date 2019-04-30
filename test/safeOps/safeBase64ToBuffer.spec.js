/*jshint expr: true*/

require("mocha");
require("chai/register-should");
const { expect } = require("chai");
const Result = require("folktale/result");
const { safeBase64ToBuffer } = require("../../lib/fpcore/safeOps");

describe("safeBase64ToBuffer", () => {
    it("should be a function", () => {
        safeBase64ToBuffer.should.be.a("function");
    });

    it("should not throw when not fed an argument", () => {
        safeBase64ToBuffer.should.not.throw();
    });
});

describe("safeBase64ToBuffer when fed a string with no numbers", () => {
    it("should create Result from 'string'", () => {
        Result.hasInstance(safeBase64ToBuffer("string")).should.be.true;
    });

    it("should hold an instance of Buffer from 'string'", () => {
        safeBase64ToBuffer("string").getOrElse(null).should.be.an.instanceof(Buffer);
    });

    it("should not hold an instance of null from 'string'", () => {
        expect(safeBase64ToBuffer("string").getOrElse(null)).to.not.be.null;
    });

    it("should not throw when fed 'string'", () => {
        expect(() => safeBase64ToBuffer("string")).to.not.throw();
    });
});

describe("safeBase64ToBuffer when fed a string with numbers", () => {
    it("should create Result from '1d3f'", () => {
        Result.hasInstance(safeBase64ToBuffer("1d3f")).should.be.true;
    });

    it("should hold an instance of Buffer from a string with numbers: '1d3f'", () => {
        safeBase64ToBuffer("1d3f").getOrElse(null).should.be.an.instanceof(Buffer);
    });

    it("should not hold an instance of null from a string with numbers: '1d3f'", () => {
        expect(safeBase64ToBuffer("1d3f").getOrElse(null)).to.not.be.null;
    });

    it("should not throw when fed '1d3f'", () => {
        expect(() => safeBase64ToBuffer("1d3f")).to.not.throw();
    });
});

describe("safeBase64ToBuffer when fed number", () => {
    it("should create Result from 12193", () => {
        Result.hasInstance(safeBase64ToBuffer(12193)).should.be.true;
    });

    it("should not hold an instance of Buffer from 12193", () => {
        expect(() => safeBase64ToBuffer(12193).getOrElse(null)).should.not.be.an.instanceof(Buffer);
    });

    it("should hold an instance of null from 12193", () => {
        expect(safeBase64ToBuffer([]).getOrElse(null)).to.be.null;
    });

    it("should not throw when fed 12193", () => {
        expect(() => safeBase64ToBuffer(12193)).to.not.throw();
    });
});

describe("safeBase64ToBuffer when fed an empty array", () => {
    it("should create Result from []", () => {
        Result.hasInstance(safeBase64ToBuffer([])).should.be.true;
    });

    it("should not hold an instance of Buffer from []", () => {
        expect(() => safeBase64ToBuffer([]).getOrElse(null)).should.not.be.an.instanceof(Buffer);
    });

    it("should hold an instance of null from []", () => {
        expect(safeBase64ToBuffer([]).getOrElse(null)).to.be.null;
    });

    it("should not throw when fed []", () => {
        expect(() => safeBase64ToBuffer([])).to.not.throw();
    });
});

describe("safeBase64ToBuffer when fed an empty object", () => {
    it("should create Result from {}", () => {
        Result.hasInstance(safeBase64ToBuffer({})).should.be.true;
    });

    it("should not hold an instance of Buffer from {}", () => {
        expect(() => safeBase64ToBuffer({}).getOrElse(null)).should.not.be.an.instanceof(Buffer);
    });

    it("should hold an instance of null from {}", () => {
        expect(safeBase64ToBuffer({}).getOrElse(null)).to.be.null;
    });

    it("should not throw when fed {}", () => {
        expect(() => safeBase64ToBuffer({})).to.not.throw();
    });
});

describe("safeBase64ToBuffer when fed a function that returns nothing", () => {
    it("should create Result from () => {}", () => {
        Result.hasInstance(safeBase64ToBuffer(() => {})).should.be.true;
    });

    it("should not hold an instance of Buffer from () => {}", () => {
        expect(() => safeBase64ToBuffer(() => {}).getOrElse(null)).should.not.be.an.instanceof(Buffer);
    });

    it("should hold an instance of null from () => {}", () => {
        expect(safeBase64ToBuffer(() => {}).getOrElse(null)).to.be.null;
    });

    it("should not throw when fed () => {}", () => {
        expect(() => safeBase64ToBuffer(() => {})).to.not.throw();
    });
});

describe("safeBase64ToBuffer when fed a null", () => {
    it("should create Result from null", () => {
        Result.hasInstance(safeBase64ToBuffer(null)).should.be.true;
    });

    it("should not hold an instance of Buffer from null", () => {
        expect(() => safeBase64ToBuffer(null).getOrElse(null)).should.not.be.an.instanceof(Buffer);
    });

    it("should hold an instance of null from null", () => {
        expect(safeBase64ToBuffer(null).getOrElse(null)).to.be.null;
    });

    it("should not throw when fed null", () => {
        expect(() => safeBase64ToBuffer(null)).to.not.throw();
    });
});

// describe("parseJSON", () => {
//     // it("should produce a Right when parsing the object '{a:1}'", () => {
//     //     parseJSON('{"a":1}').should.be.an.instanceOf(Right);
//     // });

//     // it("should properly parse '{a:1}'", () => {
//     //     parseJSON('{"a":1}').should.deep.equal(new Right({"a":1}));
//     // });

//     it("should be a function", () => {
//         parseJSON.should.be.a('function');
//     });

//     it("should not throw", () => {
//         parseJSON.should.not.throw();
//     });

//     // it("should produce a Left when parsing the string '2985s4'", () => {
//     //     parseJSON("298s54").should.be.an.instanceOf(Left);
//     // });

//     // it("should produce a Left when parsing the string '682380923'", () => {
//     //     parseJSON("682380923").should.be.an.instanceOf(Left);
//     // });

//     // it("should produce a Left when given an empty string", () => {
//     //     parseJSON("").should.be.an.instanceOf(Left);
//     // });

//     // it("should produce a Left when given the string ['32s',4,{d:2}]", () => {
//     //     parseJSON("['32s',4,{d:2}]").should.be.an.instanceOf(Left);
//     // });
// });

// describe("stringToBuffer", () => {
//     it("should produce a buffer with the string '3hjkd9'", () => {
//         stringToBuffer("3hjkd9").should.be.an.instanceOf(Buffer);
//     });

//     it("should not throw", () => {
//         stringToBuffer.should.not.throw();
//     });

//     it("should be a function", () => {
//         stringToBuffer.should.be.a('function');
//     });

//     it("should result to null when given the number 89787643", () => {
//         expect(stringToBuffer(89787643)).to.be.null;
//     });

//     it("should result to null when given the object {v:3}", () => {
//         expect(stringToBuffer({v:3})).to.be.null;
//     });

//     it("should result to null when given the array []", () => {
//         expect(stringToBuffer([])).to.be.null;
//     });

//     it("should result to null when given a null", () => {
//         expect(stringToBuffer(null)).to.be.null;
//     });

//     it("should result to null when given undefined", () => {
//         expect(stringToBuffer(undefined)).to.be.null;
//     });
// });