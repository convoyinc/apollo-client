import { assert } from 'chai';
import { scopeSelectionSetToResultPath } from '../src/data/scopeQuery';
import { createFragmentMap, getFragmentDefinitions, getQueryDefinition, getMutationDefinition, getFragmentDefinition, } from '../src/queries/getFromAST';
import gql from 'graphql-tag';
import { print, } from 'graphql-tag/printer';
describe('scoping selection set', function () {
    it('basic', function () {
        testScope((_a = ["\n        {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], gql(_a)), (_b = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], gql(_b)), ['a']);
        testScope((_c = ["\n        {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], _c.raw = ["\n        {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], gql(_c)), (_d = ["\n        {\n          d\n        }\n      "], _d.raw = ["\n        {\n          d\n        }\n      "], gql(_d)), ['a', 'c']);
        var _a, _b, _c, _d;
    });
    it('directives', function () {
        testScope((_a = ["\n        {\n          a @defer {\n            b\n            c @live {\n              d\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          a @defer {\n            b\n            c @live {\n              d\n            }\n          }\n        }\n      "], gql(_a)), (_b = ["\n        {\n          b\n          c @live {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c @live {\n            d\n          }\n        }\n      "], gql(_b)), ['a']);
        var _a, _b;
    });
    it('alias', function () {
        testScope((_a = ["\n        {\n          alias: a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          alias: a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], gql(_a)), (_b = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], gql(_b)), ['alias']);
        var _a, _b;
    });
    it('inline fragment', function () {
        testScope((_a = ["\n        {\n          ... on Query {\n            a {\n              b\n              c {\n                d\n              }\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          ... on Query {\n            a {\n              b\n              c {\n                d\n              }\n            }\n          }\n        }\n      "], gql(_a)), (_b = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], gql(_b)), ['a']);
        var _a, _b;
    });
    it('named fragment', function () {
        testScope((_a = ["\n        {\n          ...Frag\n        }\n\n        fragment Frag on Query {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], _a.raw = ["\n        {\n          ...Frag\n        }\n\n        fragment Frag on Query {\n          a {\n            b\n            c {\n              d\n            }\n          }\n        }\n      "], gql(_a)), (_b = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], _b.raw = ["\n        {\n          b\n          c {\n            d\n          }\n        }\n      "], gql(_b)), ['a']);
        var _a, _b;
    });
    describe('errors', function () {
        it('field missing', function () {
            assert.throws(function () {
                scope((_a = ["\n            {\n              a {\n                b\n              }\n            }\n          "], _a.raw = ["\n            {\n              a {\n                b\n              }\n            }\n          "], gql(_a)), ['c']);
                var _a;
            }, /No matching field/);
        });
        it('basic collision', function () {
            assert.throws(function () {
                scope((_a = ["\n            {\n              a {\n                b\n              }\n              a {\n                c\n              }\n            }\n          "], _a.raw = ["\n            {\n              a {\n                b\n              }\n              a {\n                c\n              }\n            }\n          "], gql(_a)), ['a']);
                var _a;
            }, /Multiple fields found/);
        });
        it('named fragment collision', function () {
            assert.throws(function () {
                scope((_a = ["\n            {\n              a {\n                b\n              }\n              ...Frag\n            }\n\n            fragment Frag on Query {\n              a {\n                b\n                c {\n                  d\n                }\n              }\n            }\n          "], _a.raw = ["\n            {\n              a {\n                b\n              }\n              ...Frag\n            }\n\n            fragment Frag on Query {\n              a {\n                b\n                c {\n                  d\n                }\n              }\n            }\n          "], gql(_a)), ['a']);
                var _a;
            }, /Multiple fields found/);
        });
        it('inline fragment collision', function () {
            assert.throws(function () {
                scope((_a = ["\n            {\n              a {\n                b\n              }\n              ... on Query {\n                a {\n                  b\n                  c {\n                    d\n                  }\n                }\n              }\n            }\n          "], _a.raw = ["\n            {\n              a {\n                b\n              }\n              ... on Query {\n                a {\n                  b\n                  c {\n                    d\n                  }\n                }\n              }\n            }\n          "], gql(_a)), ['a']);
                var _a;
            }, /Multiple fields found/);
        });
    });
});
function extractMainSelectionSet(doc) {
    var mainDefinition;
    try {
        mainDefinition = getQueryDefinition(doc);
    }
    catch (e) {
        try {
            mainDefinition = getMutationDefinition(doc);
        }
        catch (e) {
            try {
                mainDefinition = getFragmentDefinition(doc);
            }
            catch (e) {
                throw new Error('Could not find query, mutation, or fragment in document.');
            }
        }
    }
    return mainDefinition.selectionSet;
}
function scope(doc, path) {
    var fragmentMap = createFragmentMap(getFragmentDefinitions(doc));
    var selectionSet = extractMainSelectionSet(doc);
    return scopeSelectionSetToResultPath({
        selectionSet: selectionSet,
        fragmentMap: fragmentMap,
        path: path,
    });
}
function testScope(firstDoc, secondDoc, path) {
    assert.equal(print(scope(firstDoc, path)).trim(), print(secondDoc).trim());
}
//# sourceMappingURL=scopeQuery.js.map