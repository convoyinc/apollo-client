"use strict";
var chai_1 = require("chai");
var assign = require("lodash/assign");
var omit = require("lodash/omit");
var readFromStore_1 = require("../src/data/readFromStore");
var graphql_tag_1 = require("graphql-tag");
describe('reading from the store', function () {
    it('rejects malformed queries', function () {
        chai_1.assert.throws(function () {
            readFromStore_1.readQueryFromStore({
                store: {},
                query: (_a = ["\n          query { name }\n          query { address }\n        "], _a.raw = ["\n          query { name }\n          query { address }\n        "], graphql_tag_1.default(_a)),
            });
            var _a;
        }, /exactly one/);
        chai_1.assert.throws(function () {
            readFromStore_1.readQueryFromStore({
                store: {},
                query: (_a = ["\n          fragment x on y { name }\n        "], _a.raw = ["\n          fragment x on y { name }\n        "], graphql_tag_1.default(_a)),
            });
            var _a;
        }, /contain a query/);
    });
    it('runs a basic query', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
        };
        var store = {
            'ROOT_QUERY': result,
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        query {\n          stringField,\n          numberField\n        }\n      "], _a.raw = ["\n        query {\n          stringField,\n          numberField\n        }\n      "], graphql_tag_1.default(_a)),
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: result['stringField'],
            numberField: result['numberField'],
        });
        var _a;
    });
    it('runs a basic query with arguments', function () {
        var query = (_a = ["\n      query {\n        id,\n        stringField(arg: $stringArg),\n        numberField(intArg: $intArg, floatArg: $floatArg),\n        nullField\n      }\n    "], _a.raw = ["\n      query {\n        id,\n        stringField(arg: $stringArg),\n        numberField(intArg: $intArg, floatArg: $floatArg),\n        nullField\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            intArg: 5,
            floatArg: 3.14,
            stringArg: 'This is a string!',
        };
        var store = {
            'ROOT_QUERY': {
                id: 'abcd',
                nullField: null,
                'numberField({"intArg":5,"floatArg":3.14})': 5,
                'stringField({"arg":"This is a string!"})': 'Heyo',
            },
        };
        var result = readFromStore_1.readQueryFromStore({
            store: store,
            query: query,
            variables: variables,
        });
        chai_1.assert.deepEqual(result, {
            id: 'abcd',
            nullField: null,
            numberField: 5,
            stringField: 'Heyo',
        });
        var _a;
    });
    it('runs a nested query', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedObj: {
                id: 'abcde',
                stringField: 'This is a string too!',
                numberField: 6,
                nullField: null,
            },
        };
        var store = {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedObj')), {
                nestedObj: {
                    type: 'id',
                    id: 'abcde',
                    generated: false,
                },
            }),
            abcde: result.nestedObj,
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        {\n          stringField,\n          numberField,\n          nestedObj {\n            stringField,\n            numberField\n          }\n        }\n      "], _a.raw = ["\n        {\n          stringField,\n          numberField,\n          nestedObj {\n            stringField,\n            numberField\n          }\n        }\n      "], graphql_tag_1.default(_a)),
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: 'This is a string!',
            numberField: 5,
            nestedObj: {
                stringField: 'This is a string too!',
                numberField: 6,
            },
        });
        var _a;
    });
    it('runs a nested query with multiple fragments', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedObj: {
                id: 'abcde',
                stringField: 'This is a string too!',
                numberField: 6,
                nullField: null,
            },
            deepNestedObj: {
                stringField: 'This is a deep string',
                numberField: 7,
                nullField: null,
            },
            nullObject: null,
            __typename: 'Item',
        };
        var store = {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedObj', 'deepNestedObj')), {
                __typename: 'Query',
                nestedObj: {
                    type: 'id',
                    id: 'abcde',
                    generated: false,
                },
            }),
            abcde: assign({}, result.nestedObj, {
                deepNestedObj: {
                    type: 'id',
                    id: 'abcdef',
                    generated: false,
                },
            }),
            abcdef: result.deepNestedObj,
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        {\n          stringField,\n          numberField,\n          nullField,\n          ... on Query {\n            nestedObj {\n              stringField\n              nullField\n              deepNestedObj {\n                stringField\n                nullField\n              }\n            }\n          }\n          ... on Query {\n            nestedObj {\n              numberField\n              nullField\n              deepNestedObj {\n                numberField\n                nullField\n              }\n            }\n          }\n          ... on Query {\n            nullObject\n          }\n        }\n      "], _a.raw = ["\n        {\n          stringField,\n          numberField,\n          nullField,\n          ... on Query {\n            nestedObj {\n              stringField\n              nullField\n              deepNestedObj {\n                stringField\n                nullField\n              }\n            }\n          }\n          ... on Query {\n            nestedObj {\n              numberField\n              nullField\n              deepNestedObj {\n                numberField\n                nullField\n              }\n            }\n          }\n          ... on Query {\n            nullObject\n          }\n        }\n      "], graphql_tag_1.default(_a)),
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedObj: {
                stringField: 'This is a string too!',
                numberField: 6,
                nullField: null,
                deepNestedObj: {
                    stringField: 'This is a deep string',
                    numberField: 7,
                    nullField: null,
                },
            },
            nullObject: null,
        });
        var _a;
    });
    it('runs a nested query with an array without IDs', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedArray: [
                {
                    stringField: 'This is a string too!',
                    numberField: 6,
                    nullField: null,
                },
                {
                    stringField: 'This is a string also!',
                    numberField: 7,
                    nullField: null,
                },
            ],
        };
        var store = {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedArray')), {
                nestedArray: [
                    { type: 'id', generated: true, id: 'abcd.nestedArray.0' },
                    { type: 'id', generated: true, id: 'abcd.nestedArray.1' },
                ],
            }),
            'abcd.nestedArray.0': result.nestedArray[0],
            'abcd.nestedArray.1': result.nestedArray[1],
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        {\n          stringField,\n          numberField,\n          nestedArray {\n            stringField,\n            numberField\n          }\n        }\n      "], _a.raw = ["\n        {\n          stringField,\n          numberField,\n          nestedArray {\n            stringField,\n            numberField\n          }\n        }\n      "], graphql_tag_1.default(_a)),
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: 'This is a string!',
            numberField: 5,
            nestedArray: [
                {
                    stringField: 'This is a string too!',
                    numberField: 6,
                },
                {
                    stringField: 'This is a string also!',
                    numberField: 7,
                },
            ],
        });
        var _a;
    });
    it('runs a nested query with an array without IDs and a null', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedArray: [
                null,
                {
                    stringField: 'This is a string also!',
                    numberField: 7,
                    nullField: null,
                },
            ],
        };
        var store = {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedArray')), {
                nestedArray: [
                    null,
                    { type: 'id', generated: true, id: 'abcd.nestedArray.1' },
                ],
            }),
            'abcd.nestedArray.1': result.nestedArray[1],
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        {\n          stringField,\n          numberField,\n          nestedArray {\n            stringField,\n            numberField\n          }\n        }\n      "], _a.raw = ["\n        {\n          stringField,\n          numberField,\n          nestedArray {\n            stringField,\n            numberField\n          }\n        }\n      "], graphql_tag_1.default(_a)),
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: 'This is a string!',
            numberField: 5,
            nestedArray: [
                null,
                {
                    stringField: 'This is a string also!',
                    numberField: 7,
                },
            ],
        });
        var _a;
    });
    it('runs a nested query with an array with IDs and a null', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedArray: [
                null,
                {
                    id: 'abcde',
                    stringField: 'This is a string also!',
                    numberField: 7,
                    nullField: null,
                },
            ],
        };
        var store = {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedArray')), {
                nestedArray: [
                    null,
                    { type: 'id', generated: false, id: 'abcde' },
                ],
            }),
            'abcde': result.nestedArray[1],
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        {\n          stringField,\n          numberField,\n          nestedArray {\n            id,\n            stringField,\n            numberField\n          }\n        }\n      "], _a.raw = ["\n        {\n          stringField,\n          numberField,\n          nestedArray {\n            id,\n            stringField,\n            numberField\n          }\n        }\n      "], graphql_tag_1.default(_a)),
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: 'This is a string!',
            numberField: 5,
            nestedArray: [
                null,
                {
                    id: 'abcde',
                    stringField: 'This is a string also!',
                    numberField: 7,
                },
            ],
        });
        var _a;
    });
    it('throws on a missing field', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
        };
        var store = { 'ROOT_QUERY': result };
        chai_1.assert.throws(function () {
            readFromStore_1.readQueryFromStore({
                store: store,
                query: (_a = ["\n          {\n            stringField,\n            missingField\n          }\n        "], _a.raw = ["\n          {\n            stringField,\n            missingField\n          }\n        "], graphql_tag_1.default(_a)),
            });
            var _a;
        }, /field missingField on object/);
    });
    it('does not throw on a missing field if returnPartialData is true', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
        };
        var store = { 'ROOT_QUERY': result };
        chai_1.assert.doesNotThrow(function () {
            readFromStore_1.readQueryFromStore({
                store: store,
                query: (_a = ["\n          {\n            stringField,\n            missingField\n          }\n        "], _a.raw = ["\n          {\n            stringField,\n            missingField\n          }\n        "], graphql_tag_1.default(_a)),
                returnPartialData: true,
            });
            var _a;
        }, /field missingField on object/);
    });
    it('runs a nested query where the reference is null', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedObj: null,
        };
        var store = {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedObj')), { nestedObj: null }),
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        {\n          stringField,\n          numberField,\n          nestedObj {\n            stringField,\n            numberField\n          }\n        }\n      "], _a.raw = ["\n        {\n          stringField,\n          numberField,\n          nestedObj {\n            stringField,\n            numberField\n          }\n        }\n      "], graphql_tag_1.default(_a)),
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: 'This is a string!',
            numberField: 5,
            nestedObj: null,
        });
        var _a;
    });
    it('runs an array of non-objects', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            simpleArray: ['one', 'two', 'three'],
        };
        var store = {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'simpleArray')), { simpleArray: {
                    type: 'json',
                    json: result.simpleArray,
                } }),
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        {\n          stringField,\n          numberField,\n          simpleArray\n        }\n      "], _a.raw = ["\n        {\n          stringField,\n          numberField,\n          simpleArray\n        }\n      "], graphql_tag_1.default(_a)),
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: 'This is a string!',
            numberField: 5,
            simpleArray: ['one', 'two', 'three'],
        });
        var _a;
    });
    it('runs an array of non-objects with null', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            simpleArray: [null, 'two', 'three'],
        };
        var store = {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'simpleArray')), { simpleArray: {
                    type: 'json',
                    json: result.simpleArray,
                } }),
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        {\n          stringField,\n          numberField,\n          simpleArray\n        }\n      "], _a.raw = ["\n        {\n          stringField,\n          numberField,\n          simpleArray\n        }\n      "], graphql_tag_1.default(_a)),
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: 'This is a string!',
            numberField: 5,
            simpleArray: [null, 'two', 'three'],
        });
        var _a;
    });
    it('runs a query with custom resolvers for a computed field', function () {
        var result = {
            __typename: 'Thing',
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
        };
        var store = {
            'ROOT_QUERY': result,
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        query {\n          stringField\n          numberField\n          computedField(extra: \"bit\") @client\n        }\n      "], _a.raw = ["\n        query {\n          stringField\n          numberField\n          computedField(extra: \"bit\") @client\n        }\n      "], graphql_tag_1.default(_a)),
            config: {
                customResolvers: {
                    Thing: {
                        computedField: function (obj, args) { return obj.stringField + obj.numberField + args['extra']; },
                    },
                },
            },
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: result['stringField'],
            numberField: result['numberField'],
            computedField: 'This is a string!5bit',
        });
        var _a;
    });
    it('runs a query with custom resolvers for a computed field on root Query', function () {
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
        };
        var store = {
            'ROOT_QUERY': result,
        };
        var queryResult = readFromStore_1.readQueryFromStore({
            store: store,
            query: (_a = ["\n        query {\n          stringField\n          numberField\n          computedField(extra: \"bit\") @client\n        }\n      "], _a.raw = ["\n        query {\n          stringField\n          numberField\n          computedField(extra: \"bit\") @client\n        }\n      "], graphql_tag_1.default(_a)),
            config: {
                customResolvers: {
                    Query: {
                        computedField: function (obj, args) { return obj.stringField + obj.numberField + args['extra']; },
                    },
                },
            },
        });
        chai_1.assert.deepEqual(queryResult, {
            stringField: result['stringField'],
            numberField: result['numberField'],
            computedField: 'This is a string!5bit',
        });
        var _a;
    });
});
//# sourceMappingURL=readFromStore.js.map