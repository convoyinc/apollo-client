"use strict";
var chai_1 = require('chai');
var diffAgainstStore_1 = require('../src/data/diffAgainstStore');
var writeToStore_1 = require('../src/data/writeToStore');
var queryPrinting_1 = require('../src/queryPrinting');
var getFromAST_1 = require('../src/queries/getFromAST');
var extensions_1 = require('../src/data/extensions');
var graphql_tag_1 = require('graphql-tag');
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
        chai_1.assert.isUndefined(diffAgainstStore_1.diffQueryAgainstStore({
            store: store,
            query: query,
        }).missingSelectionSets);
        var _a;
    });
    it('works with multiple root queries', function () {
        var query = (_a = ["\n      {\n        people_one(id: \"1\") {\n          name\n        }\n        otherQuery\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: \"1\") {\n          name\n        }\n        otherQuery\n      }\n    "], graphql_tag_1.default(_a));
        var store = {};
        chai_1.assert.equal(diffAgainstStore_1.diffQueryAgainstStore({
            store: store,
            query: query,
        }).missingSelectionSets[0].selectionSet.selections.length, 2);
        var _a;
    });
    it('when the store is missing one field and doesn\'t know IDs', function () {
        var firstQuery = (_a = ["\n      {\n        people_one(id: \"1\") {\n          __typename\n          id\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: \"1\") {\n          __typename\n          id\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            people_one: {
                __typename: 'Person',
                id: 'lukeId',
                name: 'Luke Skywalker',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: result,
            query: firstQuery,
        });
        var secondQuery = (_b = ["\n      {\n        people_one(id: \"1\") {\n          name\n          age\n        }\n      }\n    "], _b.raw = ["\n      {\n        people_one(id: \"1\") {\n          name\n          age\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var missingSelectionSets = diffAgainstStore_1.diffQueryAgainstStore({
            store: store,
            query: secondQuery,
        }).missingSelectionSets;
        chai_1.assert.equal(queryPrinting_1.printQueryForMissingData({
            missingSelectionSets: missingSelectionSets,
        }), "{\n  people_one(id: \"1\") {\n    name\n    age\n  }\n}\n");
        var _a, _b;
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
        var missingSelectionSets = diffAgainstStore_1.diffQueryAgainstStore({
            store: store,
            query: secondQuery,
        }).missingSelectionSets;
        chai_1.assert.isUndefined(missingSelectionSets);
        chai_1.assert.deepEqual(store['1'], result.people_one);
        var _a, _b;
    });
    it('diffs root queries even when IDs are turned off', function () {
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
        var secondQuery = (_b = ["\n      {\n        people_one(id: \"1\") {\n          __typename\n          id\n          name\n        }\n        people_one(id: \"2\") {\n          __typename\n          id\n          name\n        }\n      }\n    "], _b.raw = ["\n      {\n        people_one(id: \"1\") {\n          __typename\n          id\n          name\n        }\n        people_one(id: \"2\") {\n          __typename\n          id\n          name\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var missingSelectionSets = diffAgainstStore_1.diffQueryAgainstStore({
            store: store,
            query: secondQuery,
        }).missingSelectionSets;
        chai_1.assert.equal(queryPrinting_1.printQueryForMissingData({
            missingSelectionSets: missingSelectionSets,
        }), "{\n  people_one(id: \"2\") {\n    __typename\n    id\n    name\n  }\n}\n");
        chai_1.assert.deepEqual(store['1'], result.people_one);
        var _a, _b;
    });
    it('works with inline fragments', function () {
        var firstQuery = (_a = ["\n      {\n        people_one(id: \"1\") {\n          __typename,\n          ... on Person {\n            id,\n            name\n          }\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: \"1\") {\n          __typename,\n          ... on Person {\n            id,\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
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
        var secondQuery = (_b = ["\n      {\n        people_one(id: \"1\") {\n          __typename\n          ... on Person {\n            id\n            name\n          }\n        }\n        people_one(id: \"2\") {\n          __typename\n          ... on Person {\n            id\n            name\n          }\n        }\n      }\n    "], _b.raw = ["\n      {\n        people_one(id: \"1\") {\n          __typename\n          ... on Person {\n            id\n            name\n          }\n        }\n        people_one(id: \"2\") {\n          __typename\n          ... on Person {\n            id\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var missingSelectionSets = diffAgainstStore_1.diffQueryAgainstStore({
            store: store,
            query: secondQuery,
        }).missingSelectionSets;
        chai_1.assert.equal(queryPrinting_1.printQueryForMissingData({
            missingSelectionSets: missingSelectionSets,
        }), "{\n  people_one(id: \"2\") {\n    __typename\n    ... on Person {\n      id\n      name\n    }\n  }\n}\n");
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
            diffAgainstStore_1.diffSelectionSetAgainstStore({
                context: {
                    store: store,
                    fragmentMap: {},
                },
                rootId: 'ROOT_QUERY',
                selectionSet: getFromAST_1.getQueryDefinition(unionQuery).selectionSet,
                variables: null,
                throwOnMissingField: true,
            });
        }, /No fragment/);
        var _a, _b;
    });
    it('does not error on a correct query with union typed fragments', function () {
        var firstQuery = (_a = ["\n      query {\n        person {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        person {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var firstResult = {
            person: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: firstResult,
            query: firstQuery,
        });
        var unionQuery = (_b = ["\n      query {\n        person {\n          ... on Author {\n            firstName\n            lastName\n          }\n\n          ... on Jedi {\n            powers\n          }\n        }\n      }"], _b.raw = ["\n      query {\n        person {\n          ... on Author {\n            firstName\n            lastName\n          }\n\n          ... on Jedi {\n            powers\n          }\n        }\n      }"], graphql_tag_1.default(_b));
        chai_1.assert.doesNotThrow(function () {
            diffAgainstStore_1.diffSelectionSetAgainstStore({
                context: {
                    store: store,
                    fragmentMap: {},
                },
                rootId: 'ROOT_QUERY',
                selectionSet: getFromAST_1.getQueryDefinition(unionQuery).selectionSet,
                variables: null,
                throwOnMissingField: true,
            });
        });
        var _a, _b;
    });
    it('does not error on a query with fields missing from all but one named fragment', function () {
        var firstQuery = (_a = ["\n      query {\n        person {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        person {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var firstResult = {
            person: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: firstResult,
            query: firstQuery,
        });
        var unionQuery = (_b = ["\n      query {\n        person {\n          ...authorInfo\n          ...jediInfo\n        }\n      }\n      fragment authorInfo on Author {\n        firstName\n      }\n      fragment jediInfo on Jedi {\n        powers\n      }"], _b.raw = ["\n      query {\n        person {\n          ...authorInfo\n          ...jediInfo\n        }\n      }\n      fragment authorInfo on Author {\n        firstName\n      }\n      fragment jediInfo on Jedi {\n        powers\n      }"], graphql_tag_1.default(_b));
        chai_1.assert.doesNotThrow(function () {
            diffAgainstStore_1.diffSelectionSetAgainstStore({
                context: {
                    store: store,
                    fragmentMap: getFromAST_1.createFragmentMap(getFromAST_1.getFragmentDefinitions(unionQuery)),
                },
                rootId: 'ROOT_QUERY',
                selectionSet: getFromAST_1.getQueryDefinition(unionQuery).selectionSet,
                variables: null,
                throwOnMissingField: true,
            });
        });
        var _a, _b;
    });
    it('throws an error on a query with fields missing from named fragments of all types', function () {
        var firstQuery = (_a = ["\n      query {\n        person {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        person {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var firstResult = {
            person: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: firstResult,
            query: firstQuery,
        });
        var unionQuery = (_b = ["\n      query {\n        person {\n          ...authorInfo\n          ...jediInfo\n        }\n      }\n      fragment authorInfo on Author {\n        firstName\n        address\n      }\n      fragment jediInfo on Jedi {\n        jedi\n      }"], _b.raw = ["\n      query {\n        person {\n          ...authorInfo\n          ...jediInfo\n        }\n      }\n      fragment authorInfo on Author {\n        firstName\n        address\n      }\n      fragment jediInfo on Jedi {\n        jedi\n      }"], graphql_tag_1.default(_b));
        chai_1.assert.throw(function () {
            diffAgainstStore_1.diffSelectionSetAgainstStore({
                context: {
                    store: store,
                    fragmentMap: getFromAST_1.createFragmentMap(getFromAST_1.getFragmentDefinitions(unionQuery)),
                },
                rootId: 'ROOT_QUERY',
                selectionSet: getFromAST_1.getQueryDefinition(unionQuery).selectionSet,
                variables: null,
                throwOnMissingField: true,
            });
        });
        var _a, _b;
    });
    it('throws an error on a query with fields missing from fragments of all types', function () {
        var firstQuery = (_a = ["\n      query {\n        person {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        person {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var firstResult = {
            person: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var store = writeToStore_1.writeQueryToStore({
            result: firstResult,
            query: firstQuery,
        });
        var unionQuery = (_b = ["\n      query {\n        person {\n          ... on Author {\n            firstName\n            address\n          }\n\n          ... on Jedi {\n            powers\n          }\n        }\n      }"], _b.raw = ["\n      query {\n        person {\n          ... on Author {\n            firstName\n            address\n          }\n\n          ... on Jedi {\n            powers\n          }\n        }\n      }"], graphql_tag_1.default(_b));
        chai_1.assert.throw(function () {
            diffAgainstStore_1.diffSelectionSetAgainstStore({
                context: {
                    store: store,
                    fragmentMap: {},
                },
                rootId: 'ROOT_QUERY',
                selectionSet: getFromAST_1.getQueryDefinition(unionQuery).selectionSet,
                variables: null,
                throwOnMissingField: true,
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
        var queryWithMissingField = (_b = ["\n      {\n        people_one(id: \"1\") {\n          name\n          age\n        }\n      }\n    "], _b.raw = ["\n      {\n        people_one(id: \"1\") {\n          name\n          age\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var result = diffAgainstStore_1.diffSelectionSetAgainstStore({
            context: { store: store, fragmentMap: {} },
            rootId: 'ROOT_QUERY',
            selectionSet: getFromAST_1.getQueryDefinition(queryWithMissingField).selectionSet,
            variables: null,
            throwOnMissingField: false,
        }).result;
        chai_1.assert.deepEqual(result, {
            people_one: {
                name: 'Luke Skywalker',
            },
        });
        chai_1.assert.throws(function () {
            diffAgainstStore_1.diffSelectionSetAgainstStore({
                context: { store: store, fragmentMap: {} },
                rootId: 'ROOT_QUERY',
                selectionSet: getFromAST_1.getQueryDefinition(queryWithMissingField).selectionSet,
                variables: null,
                throwOnMissingField: true,
            });
        });
        var _a, _b;
    });
});
//# sourceMappingURL=diffAgainstStore.js.map