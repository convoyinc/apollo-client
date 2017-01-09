"use strict";
var chai_1 = require("chai");
var readFromStore_1 = require("../src/data/readFromStore");
var writeToStore_1 = require("../src/data/writeToStore");
var extensions_1 = require("../src/data/extensions");
var graphql_tag_1 = require("graphql-tag");
describe('diffing queries against the store', function () {
    it('returns nothing when the store is enough', function () {
        var query = (_a = ["\n      {\n        people_one(id: \"1\") {\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: \"1\") {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: result,
            query: query,
        });
        chai_1.assert.notOk(readFromStore_1.diffQueryAgainstStore({
            store: store,
            query: query,
        }).isMissing);
        var _a;
    });
    it('caches root queries both under the ID of the node and the query name', function () {
        var firstQuery = (_a = ["\n      {\n        people_one(id: \"1\") {\n          __typename,\n          id,\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: \"1\") {\n          __typename,\n          id,\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            people_one: {
                __typename: 'Person',
                id: '1',
                name: 'Luke Skywalker',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: result,
            query: firstQuery,
            dataIdFromObject: extensions_1.getIdField,
        });
        var secondQuery = (_b = ["\n      {\n        people_one(id: \"1\") {\n          __typename,\n          id,\n          name\n        }\n      }\n    "], _b.raw = ["\n      {\n        people_one(id: \"1\") {\n          __typename,\n          id,\n          name\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var isMissing = readFromStore_1.diffQueryAgainstStore({
            store: store,
            query: secondQuery,
        }).isMissing;
        chai_1.assert.notOk(isMissing);
        chai_1.assert.deepEqual(store['1'], result.people_one);
        var _a, _b;
    });
    it('does not swallow errors other than field errors', function () {
        var firstQuery = (_a = ["\n      query {\n        person {\n          powers\n        }\n      }"], _a.raw = ["\n      query {\n        person {\n          powers\n        }\n      }"], graphql_tag_1.default(_a));
        var firstResult = {
            person: {
                powers: 'the force',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: firstResult,
            query: firstQuery,
        });
        var unionQuery = (_b = ["\n      query {\n        ...notARealFragment\n      }"], _b.raw = ["\n      query {\n        ...notARealFragment\n      }"], graphql_tag_1.default(_b));
        chai_1.assert.throws(function () {
            readFromStore_1.diffQueryAgainstStore({
                store: store,
                query: unionQuery,
                variables: null,
            });
        }, /No fragment/);
        var _a, _b;
    });
    it('does not error on a correct query with union typed fragments', function () {
        var firstQuery = (_a = ["\n      query {\n        person {\n          __typename\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        person {\n          __typename\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var firstResult = {
            person: {
                __typename: 'Author',
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: firstResult,
            query: firstQuery,
        });
        var unionQuery = (_b = ["\n      query {\n        person {\n          __typename\n          ... on Author {\n            firstName\n            lastName\n          }\n\n          ... on Jedi {\n            powers\n          }\n        }\n      }"], _b.raw = ["\n      query {\n        person {\n          __typename\n          ... on Author {\n            firstName\n            lastName\n          }\n\n          ... on Jedi {\n            powers\n          }\n        }\n      }"], graphql_tag_1.default(_b));
        var isMissing = readFromStore_1.diffQueryAgainstStore({
            store: store,
            query: unionQuery,
            variables: null,
            returnPartialData: false,
        }).isMissing;
        chai_1.assert.isTrue(isMissing);
        var _a, _b;
    });
    it('does not error on a query with fields missing from all but one named fragment', function () {
        var firstQuery = (_a = ["\n      query {\n        person {\n          __typename\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        person {\n          __typename\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var firstResult = {
            person: {
                __typename: 'Author',
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: firstResult,
            query: firstQuery,
        });
        var unionQuery = (_b = ["\n      query {\n        person {\n          __typename\n          ...authorInfo\n          ...jediInfo\n        }\n      }\n      fragment authorInfo on Author {\n        firstName\n      }\n      fragment jediInfo on Jedi {\n        powers\n      }"], _b.raw = ["\n      query {\n        person {\n          __typename\n          ...authorInfo\n          ...jediInfo\n        }\n      }\n      fragment authorInfo on Author {\n        firstName\n      }\n      fragment jediInfo on Jedi {\n        powers\n      }"], graphql_tag_1.default(_b));
        var isMissing = readFromStore_1.diffQueryAgainstStore({
            store: store,
            query: unionQuery,
            variables: null,
            returnPartialData: false,
        }).isMissing;
        chai_1.assert.isTrue(isMissing);
        var _a, _b;
    });
    it('throws an error on a query with fields missing from matching named fragments', function () {
        var firstQuery = (_a = ["\n      query {\n        person {\n          __typename\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        person {\n          __typename\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var firstResult = {
            person: {
                __typename: 'Author',
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: firstResult,
            query: firstQuery,
        });
        var unionQuery = (_b = ["\n      query {\n        person {\n          __typename\n          ...authorInfo\n          ...jediInfo\n        }\n      }\n      fragment authorInfo on Author {\n        firstName\n        address\n      }\n      fragment jediInfo on Jedi {\n        jedi\n      }"], _b.raw = ["\n      query {\n        person {\n          __typename\n          ...authorInfo\n          ...jediInfo\n        }\n      }\n      fragment authorInfo on Author {\n        firstName\n        address\n      }\n      fragment jediInfo on Jedi {\n        jedi\n      }"], graphql_tag_1.default(_b));
        chai_1.assert.throw(function () {
            readFromStore_1.diffQueryAgainstStore({
                store: store,
                query: unionQuery,
                variables: null,
                returnPartialData: false,
            });
        });
        var _a, _b;
    });
    it('returns available fields if throwOnMissingField is false', function () {
        var firstQuery = (_a = ["\n      {\n        people_one(id: \"1\") {\n          __typename\n          id\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: \"1\") {\n          __typename\n          id\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var firstResult = {
            people_one: {
                __typename: 'Person',
                id: 'lukeId',
                name: 'Luke Skywalker',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: firstResult,
            query: firstQuery,
        });
        var simpleQuery = (_b = ["\n      {\n        people_one(id: \"1\") {\n          name\n          age\n        }\n      }\n    "], _b.raw = ["\n      {\n        people_one(id: \"1\") {\n          name\n          age\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var inlineFragmentQuery = (_c = ["\n      {\n        people_one(id: \"1\") {\n          ... on Person {\n            name\n            age\n          }\n        }\n      }\n    "], _c.raw = ["\n      {\n        people_one(id: \"1\") {\n          ... on Person {\n            name\n            age\n          }\n        }\n      }\n    "], graphql_tag_1.default(_c));
        var namedFragmentQuery = (_d = ["\n      query {\n        people_one(id: \"1\") {\n          ...personInfo\n        }\n      }\n      fragment personInfo on Person {\n        name\n        age\n      }"], _d.raw = ["\n      query {\n        people_one(id: \"1\") {\n          ...personInfo\n        }\n      }\n      fragment personInfo on Person {\n        name\n        age\n      }"], graphql_tag_1.default(_d));
        var simpleDiff = readFromStore_1.diffQueryAgainstStore({
            store: store,
            query: simpleQuery,
            variables: null,
        });
        chai_1.assert.deepEqual(simpleDiff.result, {
            people_one: {
                name: 'Luke Skywalker',
            },
        });
        var inlineDiff = readFromStore_1.diffQueryAgainstStore({
            store: store,
            query: inlineFragmentQuery,
            variables: null,
        });
        chai_1.assert.deepEqual(inlineDiff.result, {
            people_one: {
                name: 'Luke Skywalker',
            },
        });
        var namedDiff = readFromStore_1.diffQueryAgainstStore({
            store: store,
            query: namedFragmentQuery,
            variables: null,
        });
        chai_1.assert.deepEqual(namedDiff.result, {
            people_one: {
                name: 'Luke Skywalker',
            },
        });
        chai_1.assert.throws(function () {
            readFromStore_1.diffQueryAgainstStore({
                store: store,
                query: simpleQuery,
                variables: null,
                returnPartialData: false,
            });
        });
        var _a, _b, _c, _d;
    });
});
//# sourceMappingURL=diffAgainstStore.js.map