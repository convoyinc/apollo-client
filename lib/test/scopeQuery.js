"use strict";
var chai_1 = require("chai");
var scopeQuery_1 = require("../src/data/scopeQuery");
var getFromAST_1 = require("../src/queries/getFromAST");
var graphql_tag_1 = require("graphql-tag");
var printer_1 = require("graphql-tag/printer");
describe('scoping selection set', function () {
    it('basic', function () {
        testScope((_a = ["\n        {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], graphql_tag_1.default(_a)), (_b = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], graphql_tag_1.default(_b)), ['a']);
        testScope((_c = ["\n        {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], _c.raw = ["\n        {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], graphql_tag_1.default(_c)), (_d = ["\n        {\n          d\n        }\n      "], _d.raw = ["\n        {\n          d\n        }\n      "], graphql_tag_1.default(_d)), ['a', 'c']);
        var _a, _b, _c, _d;
    });
    it('directives', function () {
        testScope((_a = ["\n        {\n          a @defer {\n            b\n            c @live {\n              d\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          a @defer {\n            b\n            c @live {\n              d\n            }\n          }\n        }\n      "], graphql_tag_1.default(_a)), (_b = ["\n        {\n          b\n          c @live {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c @live {\n            d\n          }\n        }\n      "], graphql_tag_1.default(_b)), ['a']);
        var _a, _b;
    });
    it('alias', function () {
        testScope((_a = ["\n        {\n          alias: a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          alias: a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], graphql_tag_1.default(_a)), (_b = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], graphql_tag_1.default(_b)), ['alias']);
        var _a, _b;
    });
    it('inline fragment', function () {
        testScope((_a = ["\n        {\n          ... on Query {\n            a {\n              b\n              c {\n                d\n              }\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          ... on Query {\n            a {\n              b\n              c {\n                d\n              }\n            }\n          }\n        }\n      "], graphql_tag_1.default(_a)), (_b = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], graphql_tag_1.default(_b)), ['a']);
        var _a, _b;
    });
    it('named fragment', function () {
        testScope((_a = ["\n        {\n          ...Frag\n        }\n\n        fragment Frag on Query {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          ...Frag\n        }\n\n        fragment Frag on Query {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], graphql_tag_1.default(_a)), (_b = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], graphql_tag_1.default(_b)), ['a']);
        var _a, _b;
    });
    describe('errors', function () {
        it('field missing', function () {
            chai_1.assert.throws(function () {
                scope((_a = ["\n            {\n              a {\n                b\n              }\n            }\n          "], _a.raw = ["\n            {\n              a {\n                b\n              }\n            }\n          "], graphql_tag_1.default(_a)), ['c']);
                var _a;
            }, /No matching field/);
        });
        it('basic collision', function () {
            chai_1.assert.throws(function () {
                scope((_a = ["\n            {\n              a {\n                b\n              }\n              a {\n                c\n              }\n            }\n          "], _a.raw = ["\n            {\n              a {\n                b\n              }\n              a {\n                c\n              }\n            }\n          "], graphql_tag_1.default(_a)), ['a']);
                var _a;
            }, /Multiple fields found/);
        });
        it('named fragment collision', function () {
            chai_1.assert.throws(function () {
                scope((_a = ["\n            {\n              a {\n                b\n              }\n              ...Frag\n            }\n\n            fragment Frag on Query {\n              a {\n                b\n                c {\n                  d\n                }\n              }\n            }\n          "], _a.raw = ["\n            {\n              a {\n                b\n              }\n              ...Frag\n            }\n\n            fragment Frag on Query {\n              a {\n                b\n                c {\n                  d\n                }\n              }\n            }\n          "], graphql_tag_1.default(_a)), ['a']);
                var _a;
            }, /Multiple fields found/);
        });
        it('inline fragment collision', function () {
            chai_1.assert.throws(function () {
                scope((_a = ["\n            {\n              a {\n                b\n              }\n              ... on Query {\n                a {\n                  b\n                  c {\n                    d\n                  }\n                }\n              }\n            }\n          "], _a.raw = ["\n            {\n              a {\n                b\n              }\n              ... on Query {\n                a {\n                  b\n                  c {\n                    d\n                  }\n                }\n              }\n            }\n          "], graphql_tag_1.default(_a)), ['a']);
                var _a;
            }, /Multiple fields found/);
        });
    });
});
function extractMainSelectionSet(doc) {
    var mainDefinition;
    try {
        mainDefinition = getFromAST_1.getQueryDefinition(doc);
    }
    catch (e) {
        try {
            mainDefinition = getFromAST_1.getMutationDefinition(doc);
        }
        catch (e) {
            try {
                mainDefinition = getFromAST_1.getFragmentDefinition(doc);
            }
            catch (e) {
                throw new Error('Could not find query, mutation, or fragment in document.');
            }
        }
    }
    return mainDefinition.selectionSet;
}
function scope(doc, path) {
    var fragmentMap = getFromAST_1.createFragmentMap(getFromAST_1.getFragmentDefinitions(doc));
    var selectionSet = extractMainSelectionSet(doc);
    return scopeQuery_1.scopeSelectionSetToResultPath({
        selectionSet: selectionSet,
        fragmentMap: fragmentMap,
        path: path,
    });
}
function testScope(firstDoc, secondDoc, path) {
    chai_1.assert.equal(printer_1.print(scope(firstDoc, path)).trim(), printer_1.print(secondDoc).trim());
}
//# sourceMappingURL=scopeQuery.js.map