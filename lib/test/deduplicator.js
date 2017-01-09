"use strict";
var graphql_tag_1 = require("graphql-tag");
var chai_1 = require("chai");
var Deduplicator_1 = require("../src/transport/Deduplicator");
var getFromAST_1 = require("../src/queries/getFromAST");
describe('query deduplication', function () {
    it("does not affect different queries", function () {
        var document = (_a = ["query test1($x: String){\n      test(x: $x)\n    }"], _a.raw = ["query test1($x: String){\n      test(x: $x)\n    }"], graphql_tag_1.default(_a));
        var variables1 = { x: 'Hello World' };
        var variables2 = { x: 'Goodbye World' };
        var request1 = {
            query: document,
            variables: variables1,
            operationName: getFromAST_1.getOperationName(document),
        };
        var request2 = {
            query: document,
            variables: variables2,
            operationName: getFromAST_1.getOperationName(document),
        };
        var called = 0;
        var deduper = new Deduplicator_1.Deduplicator({
            query: function () {
                called += 1;
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 5);
                });
            },
        });
        deduper.query(request1);
        deduper.query(request2);
        chai_1.assert.equal(called, 2);
        var _a;
    });
    it("deduplicates identical queries", function () {
        var document = (_a = ["query test1($x: String){\n      test(x: $x)\n    }"], _a.raw = ["query test1($x: String){\n      test(x: $x)\n    }"], graphql_tag_1.default(_a));
        var variables1 = { x: 'Hello World' };
        var variables2 = { x: 'Hello World' };
        var request1 = {
            query: document,
            variables: variables1,
            operationName: getFromAST_1.getOperationName(document),
        };
        var request2 = {
            query: document,
            variables: variables2,
            operationName: getFromAST_1.getOperationName(document),
        };
        var called = 0;
        var deduper = new Deduplicator_1.Deduplicator({
            query: function () {
                called += 1;
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 5);
                });
            },
        });
        deduper.query(request1);
        deduper.query(request2);
        chai_1.assert.equal(called, 1);
        var _a;
    });
    it("can bypass deduplication if desired", function () {
        var document = (_a = ["query test1($x: String){\n      test(x: $x)\n    }"], _a.raw = ["query test1($x: String){\n      test(x: $x)\n    }"], graphql_tag_1.default(_a));
        var variables1 = { x: 'Hello World' };
        var variables2 = { x: 'Hello World' };
        var request1 = {
            query: document,
            variables: variables1,
            operationName: getFromAST_1.getOperationName(document),
        };
        var request2 = {
            query: document,
            variables: variables2,
            operationName: getFromAST_1.getOperationName(document),
        };
        var called = 0;
        var deduper = new Deduplicator_1.Deduplicator({
            query: function () {
                called += 1;
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 5);
                });
            },
        });
        deduper.query(request1, false);
        deduper.query(request2, false);
        chai_1.assert.equal(called, 2);
        var _a;
    });
});
//# sourceMappingURL=deduplicator.js.map