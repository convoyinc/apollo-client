"use strict";
var chai_1 = require("chai");
var cloneDeep = require("lodash/cloneDeep");
var assign = require("lodash/assign");
var omit = require("lodash/omit");
var writeToStore_1 = require("../src/data/writeToStore");
var storeUtils_1 = require("../src/data/storeUtils");
var extensions_1 = require("../src/data/extensions");
var graphql_tag_1 = require("graphql-tag");
describe('writing to the store', function () {
    it('properly normalizes a trivial item', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
        };
        chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
        }), {
            'ROOT_QUERY': result,
        });
        var _a;
    });
    it('properly normalizes an aliased field', function () {
        var query = (_a = ["\n      {\n        id,\n        aliasedField: stringField,\n        numberField,\n        nullField\n      }\n    "], _a.raw = ["\n      {\n        id,\n        aliasedField: stringField,\n        numberField,\n        nullField\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            aliasedField: 'This is a string!',
            numberField: 5,
            nullField: null,
        };
        var normalized = writeToStore_1.writeQueryToStore({
            result: result,
            query: query,
        });
        chai_1.assert.deepEqual(normalized, {
            'ROOT_QUERY': {
                id: 'abcd',
                stringField: 'This is a string!',
                numberField: 5,
                nullField: null,
            },
        });
        var _a;
    });
    it('properly normalizes a aliased fields with arguments', function () {
        var query = (_a = ["\n      {\n        id,\n        aliasedField1: stringField(arg: 1),\n        aliasedField2: stringField(arg: 2),\n        numberField,\n        nullField\n      }\n    "], _a.raw = ["\n      {\n        id,\n        aliasedField1: stringField(arg: 1),\n        aliasedField2: stringField(arg: 2),\n        numberField,\n        nullField\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            aliasedField1: 'The arg was 1!',
            aliasedField2: 'The arg was 2!',
            numberField: 5,
            nullField: null,
        };
        var normalized = writeToStore_1.writeQueryToStore({
            result: result,
            query: query,
        });
        chai_1.assert.deepEqual(normalized, {
            'ROOT_QUERY': {
                id: 'abcd',
                'stringField({"arg":1})': 'The arg was 1!',
                'stringField({"arg":2})': 'The arg was 2!',
                numberField: 5,
                nullField: null,
            },
        });
        var _a;
    });
    it('properly normalizes a query with variables', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField(arg: $stringArg),\n        numberField(intArg: $intArg, floatArg: $floatArg),\n        nullField\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField(arg: $stringArg),\n        numberField(intArg: $intArg, floatArg: $floatArg),\n        nullField\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            intArg: 5,
            floatArg: 3.14,
            stringArg: 'This is a string!',
        };
        var result = {
            id: 'abcd',
            stringField: 'Heyo',
            numberField: 5,
            nullField: null,
        };
        var normalized = writeToStore_1.writeQueryToStore({
            result: result,
            query: query,
            variables: variables,
        });
        chai_1.assert.deepEqual(normalized, {
            'ROOT_QUERY': {
                id: 'abcd',
                nullField: null,
                'numberField({"intArg":5,"floatArg":3.14})': 5,
                'stringField({"arg":"This is a string!"})': 'Heyo',
            },
        });
        var _a;
    });
    it('properly normalizes a nested object with an ID', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedObj {\n          id,\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedObj {\n          id,\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], graphql_tag_1.default(_a));
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
        chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
            dataIdFromObject: extensions_1.getIdField,
        }), (_b = {
                'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedObj')), {
                    nestedObj: {
                        type: 'id',
                        id: result.nestedObj.id,
                        generated: false,
                    },
                })
            },
            _b[result.nestedObj.id] = result.nestedObj,
            _b));
        var _a, _b;
    });
    it('properly normalizes a nested object without an ID', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedObj {\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedObj {\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedObj: {
                stringField: 'This is a string too!',
                numberField: 6,
                nullField: null,
            },
        };
        chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
        }), (_b = {
                'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedObj')), {
                    nestedObj: {
                        type: 'id',
                        id: "$ROOT_QUERY.nestedObj",
                        generated: true,
                    },
                })
            },
            _b["$ROOT_QUERY.nestedObj"] = result.nestedObj,
            _b));
        var _a, _b;
    });
    it('properly normalizes a nested object with arguments but without an ID', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedObj(arg: \"val\") {\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedObj(arg: \"val\") {\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedObj: {
                stringField: 'This is a string too!',
                numberField: 6,
                nullField: null,
            },
        };
        chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
        }), (_b = {
                'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedObj')), {
                    'nestedObj({"arg":"val"})': {
                        type: 'id',
                        id: "$ROOT_QUERY.nestedObj({\"arg\":\"val\"})",
                        generated: true,
                    },
                })
            },
            _b["$ROOT_QUERY.nestedObj({\"arg\":\"val\"})"] = result.nestedObj,
            _b));
        var _a, _b;
    });
    it('properly normalizes a nested array with IDs', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedArray {\n          id,\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedArray {\n          id,\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedArray: [
                {
                    id: 'abcde',
                    stringField: 'This is a string too!',
                    numberField: 6,
                    nullField: null,
                },
                {
                    id: 'abcdef',
                    stringField: 'This is a string also!',
                    numberField: 7,
                    nullField: null,
                },
            ],
        };
        chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
            dataIdFromObject: extensions_1.getIdField,
        }), (_b = {
                'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedArray')), {
                    nestedArray: result.nestedArray.map(function (obj) { return ({
                        type: 'id',
                        id: obj.id,
                        generated: false,
                    }); }),
                })
            },
            _b[result.nestedArray[0].id] = result.nestedArray[0],
            _b[result.nestedArray[1].id] = result.nestedArray[1],
            _b));
        var _a, _b;
    });
    it('properly normalizes a nested array with IDs and a null', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedArray {\n          id,\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedArray {\n          id,\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedArray: [
                {
                    id: 'abcde',
                    stringField: 'This is a string too!',
                    numberField: 6,
                    nullField: null,
                },
                null,
            ],
        };
        chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
            dataIdFromObject: extensions_1.getIdField,
        }), (_b = {
                'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedArray')), {
                    nestedArray: [
                        { type: 'id', id: result.nestedArray[0].id, generated: false },
                        null,
                    ],
                })
            },
            _b[result.nestedArray[0].id] = result.nestedArray[0],
            _b));
        var _a, _b;
    });
    it('properly normalizes a nested array without IDs', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedArray {\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedArray {\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], graphql_tag_1.default(_a));
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
        var normalized = writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
        });
        chai_1.assert.deepEqual(normalized, (_b = {
                'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedArray')), {
                    nestedArray: [
                        { type: 'id', generated: true, id: "ROOT_QUERY.nestedArray.0" },
                        { type: 'id', generated: true, id: "ROOT_QUERY.nestedArray.1" },
                    ],
                })
            },
            _b["ROOT_QUERY.nestedArray.0"] = result.nestedArray[0],
            _b["ROOT_QUERY.nestedArray.1"] = result.nestedArray[1],
            _b));
        var _a, _b;
    });
    it('properly normalizes a nested array without IDs and a null item', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedArray {\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedArray {\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], graphql_tag_1.default(_a));
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
        var normalized = writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
        });
        chai_1.assert.deepEqual(normalized, (_b = {
                'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedArray')), {
                    nestedArray: [
                        null,
                        { type: 'id', generated: true, id: "ROOT_QUERY.nestedArray.1" },
                    ],
                })
            },
            _b["ROOT_QUERY.nestedArray.1"] = result.nestedArray[1],
            _b));
        var _a, _b;
    });
    it('properly normalizes an array of non-objects', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        simpleArray\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        simpleArray\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            simpleArray: ['one', 'two', 'three'],
        };
        var normalized = writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
            dataIdFromObject: extensions_1.getIdField,
        });
        chai_1.assert.deepEqual(normalized, {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'simpleArray')), {
                simpleArray: {
                    type: 'json',
                    'json': [
                        result.simpleArray[0],
                        result.simpleArray[1],
                        result.simpleArray[2],
                    ],
                },
            }),
        });
        var _a;
    });
    it('properly normalizes an array of non-objects with null', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        simpleArray\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        simpleArray\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            simpleArray: [null, 'two', 'three'],
        };
        var normalized = writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
        });
        chai_1.assert.deepEqual(normalized, {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'simpleArray')), {
                simpleArray: {
                    type: 'json',
                    json: [
                        result.simpleArray[0],
                        result.simpleArray[1],
                        result.simpleArray[2],
                    ],
                },
            }),
        });
        var _a;
    });
    it('merges nodes', function () {
        var query = (_a = ["\n      {\n        id,\n        numberField,\n        nullField\n      }\n    "], _a.raw = ["\n      {\n        id,\n        numberField,\n        nullField\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            numberField: 5,
            nullField: null,
        };
        var store = writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
            dataIdFromObject: extensions_1.getIdField,
        });
        var query2 = (_b = ["\n      {\n        id,\n        stringField,\n        nullField\n      }\n    "], _b.raw = ["\n      {\n        id,\n        stringField,\n        nullField\n      }\n    "], graphql_tag_1.default(_b));
        var result2 = {
            id: 'abcd',
            stringField: 'This is a string!',
            nullField: null,
        };
        var store2 = writeToStore_1.writeQueryToStore({
            store: store,
            query: query2,
            result: result2,
            dataIdFromObject: extensions_1.getIdField,
        });
        chai_1.assert.deepEqual(store2, {
            'ROOT_QUERY': assign({}, result, result2),
        });
        var _a, _b;
    });
    it('properly normalizes a nested object that returns null', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedObj {\n          id,\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField,\n        nestedObj {\n          id,\n          stringField,\n          numberField,\n          nullField\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
            nestedObj: null,
        };
        chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
        }), {
            'ROOT_QUERY': assign({}, assign({}, omit(result, 'nestedObj')), {
                nestedObj: null,
            }),
        });
        var _a;
    });
    it('properly normalizes an object with an ID when no extension is passed', function () {
        var query = (_a = ["\n      {\n        people_one(id: \"5\") {\n          id\n          stringField\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: \"5\") {\n          id\n          stringField\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            people_one: {
                id: 'abcd',
                stringField: 'This is a string!',
            },
        };
        chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
        }), {
            'ROOT_QUERY': {
                'people_one({"id":"5"})': {
                    type: 'id',
                    id: '$ROOT_QUERY.people_one({"id":"5"})',
                    generated: true,
                },
            },
            '$ROOT_QUERY.people_one({"id":"5"})': {
                'id': 'abcd',
                'stringField': 'This is a string!',
            },
        });
        var _a;
    });
    it('consistently serialize different types of input when passed inlined or as variable', function () {
        var testData = [
            {
                mutation: (_a = ["mutation mut($in: Int!) { mut(inline: 5, variable: $in) { id } }"], _a.raw = ["mutation mut($in: Int!) { mut(inline: 5, variable: $in) { id } }"], graphql_tag_1.default(_a)),
                variables: { in: 5 },
                expected: 'mut({"inline":5,"variable":5})',
            },
            {
                mutation: (_b = ["mutation mut($in: Float!) { mut(inline: 5.5, variable: $in) { id } }"], _b.raw = ["mutation mut($in: Float!) { mut(inline: 5.5, variable: $in) { id } }"], graphql_tag_1.default(_b)),
                variables: { in: 5.5 },
                expected: 'mut({"inline":5.5,"variable":5.5})',
            },
            {
                mutation: (_c = ["mutation mut($in: String!) { mut(inline: \"abc\", variable: $in) { id } }"], _c.raw = ["mutation mut($in: String!) { mut(inline: \"abc\", variable: $in) { id } }"], graphql_tag_1.default(_c)),
                variables: { in: 'abc' },
                expected: 'mut({"inline":"abc","variable":"abc"})',
            },
            {
                mutation: (_d = ["mutation mut($in: Array!) { mut(inline: [1, 2], variable: $in) { id } }"], _d.raw = ["mutation mut($in: Array!) { mut(inline: [1, 2], variable: $in) { id } }"], graphql_tag_1.default(_d)),
                variables: { in: [1, 2] },
                expected: 'mut({"inline":[1,2],"variable":[1,2]})',
            },
            {
                mutation: (_e = ["mutation mut($in: Object!) { mut(inline: {a: 1}, variable: $in) { id } }"], _e.raw = ["mutation mut($in: Object!) { mut(inline: {a: 1}, variable: $in) { id } }"], graphql_tag_1.default(_e)),
                variables: { in: { a: 1 } },
                expected: 'mut({"inline":{"a":1},"variable":{"a":1}})',
            },
            {
                mutation: (_f = ["mutation mut($in: Boolean!) { mut(inline: true, variable: $in) { id } }"], _f.raw = ["mutation mut($in: Boolean!) { mut(inline: true, variable: $in) { id } }"], graphql_tag_1.default(_f)),
                variables: { in: true },
                expected: 'mut({"inline":true,"variable":true})',
            },
        ];
        function isOperationDefinition(definition) {
            return definition.kind === 'OperationDefinition';
        }
        function isField(selection) {
            return selection.kind === 'Field';
        }
        testData.forEach(function (data) {
            data.mutation.definitions.forEach(function (definition) {
                if (isOperationDefinition(definition)) {
                    definition.selectionSet.selections.forEach(function (selection) {
                        if (isField(selection)) {
                            chai_1.assert.equal(storeUtils_1.storeKeyNameFromField(selection, data.variables), data.expected);
                        }
                    });
                }
            });
        });
        var _a, _b, _c, _d, _e, _f;
    });
    it('properly normalizes a mutation with object or array parameters and variables', function () {
        var mutation = (_a = ["\n      mutation some_mutation(\n          $nil: ID,\n          $in: Object\n        ) {\n        some_mutation(\n          input: {\n            id: \"5\",\n            arr: [1,{a:\"b\"}],\n            obj: {a:\"b\"},\n            num: 5.5,\n            nil: $nil,\n            bo: true\n          },\n        ) {\n          id,\n        }\n        some_mutation_with_variables(\n          input: $in,\n        ) {\n          id,\n        }\n      }\n    "], _a.raw = ["\n      mutation some_mutation(\n          $nil: ID,\n          $in: Object\n        ) {\n        some_mutation(\n          input: {\n            id: \"5\",\n            arr: [1,{a:\"b\"}],\n            obj: {a:\"b\"},\n            num: 5.5,\n            nil: $nil,\n            bo: true\n          },\n        ) {\n          id,\n        }\n        some_mutation_with_variables(\n          input: $in,\n        ) {\n          id,\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            some_mutation: {
                id: 'id',
            },
            some_mutation_with_variables: {
                id: 'id',
            },
        };
        var variables = {
            nil: null,
            in: {
                id: '5',
                arr: [1, { a: 'b' }],
                obj: { a: 'b' },
                num: 5.5,
                nil: null,
                bo: true,
            },
        };
        function isOperationDefinition(value) {
            return value.kind === 'OperationDefinition';
        }
        mutation.definitions.map(function (def) {
            if (isOperationDefinition(def)) {
                chai_1.assert.deepEqual(writeToStore_1.writeSelectionSetToStore({
                    dataId: '5',
                    selectionSet: def.selectionSet,
                    result: cloneDeep(result),
                    context: {
                        store: {},
                        variables: variables,
                        dataIdFromObject: function () { return '5'; },
                    },
                }), {
                    '5': {
                        'some_mutation({"input":{"id":"5","arr":[1,{"a":"b"}],"obj":{"a":"b"},"num":5.5,"nil":null,"bo":true}})': {
                            type: 'id',
                            id: '5',
                            generated: false,
                        },
                        'some_mutation_with_variables({"input":{"id":"5","arr":[1,{"a":"b"}],"obj":{"a":"b"},"num":5.5,"nil":null,"bo":true}})': {
                            type: 'id',
                            id: '5',
                            generated: false,
                        },
                        'id': 'id',
                    },
                });
            }
            else {
                throw 'No operation definition found';
            }
        });
        var _a;
    });
    describe('type escaping', function () {
        var dataIdFromObject = function (object) {
            if (object.__typename && object.id) {
                return object.__typename + '__' + object.id;
            }
            return undefined;
        };
        it('should correctly escape generated ids', function () {
            var query = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var expStore = {
                ROOT_QUERY: {
                    author: {
                        type: 'id',
                        id: '$ROOT_QUERY.author',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.author': data.author,
            };
            chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
                result: data,
                query: query,
            }), expStore);
            var _a;
        });
        it('should correctly escape real ids', function () {
            var query = (_a = ["\n        query {\n          author {\n            firstName\n            id\n            __typename\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            id\n            __typename\n          }\n        }"], graphql_tag_1.default(_a));
            var data = {
                author: {
                    firstName: 'John',
                    id: '129',
                    __typename: 'Author',
                },
            };
            var expStore = (_b = {
                    ROOT_QUERY: {
                        author: {
                            type: 'id',
                            id: dataIdFromObject(data.author),
                            generated: false,
                        },
                    }
                },
                _b[dataIdFromObject(data.author)] = {
                    firstName: data.author.firstName,
                    id: data.author.id,
                    __typename: data.author.__typename,
                },
                _b);
            chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
                result: data,
                query: query,
                dataIdFromObject: dataIdFromObject,
            }), expStore);
            var _a, _b;
        });
        it('should correctly escape json blobs', function () {
            var query = (_a = ["\n        query {\n          author {\n            info\n            id\n            __typename\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            info\n            id\n            __typename\n          }\n        }"], graphql_tag_1.default(_a));
            var data = {
                author: {
                    info: {
                        name: 'John',
                    },
                    id: '129',
                    __typename: 'Author',
                },
            };
            var expStore = (_b = {
                    ROOT_QUERY: {
                        author: {
                            type: 'id',
                            id: dataIdFromObject(data.author),
                            generated: false,
                        },
                    }
                },
                _b[dataIdFromObject(data.author)] = {
                    __typename: data.author.__typename,
                    id: data.author.id,
                    info: {
                        type: 'json',
                        json: data.author.info,
                    },
                },
                _b);
            chai_1.assert.deepEqual(writeToStore_1.writeQueryToStore({
                result: data,
                query: query,
                dataIdFromObject: dataIdFromObject,
            }), expStore);
            var _a, _b;
        });
    });
    it('should merge objects when overwriting a generated id with a real id', function () {
        var dataWithoutId = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var dataWithId = {
            author: {
                firstName: 'John',
                id: '129',
                __typename: 'Author',
            },
        };
        var dataIdFromObject = function (object) {
            if (object.__typename && object.id) {
                return object.__typename + '__' + object.id;
            }
            return undefined;
        };
        var queryWithoutId = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var queryWithId = (_b = ["\n      query {\n        author {\n          firstName\n          id\n          __typename\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          firstName\n          id\n          __typename\n        }\n      }"], graphql_tag_1.default(_b));
        var expStoreWithoutId = {
            '$ROOT_QUERY.author': {
                firstName: 'John',
                lastName: 'Smith',
            },
            ROOT_QUERY: {
                'author': {
                    type: 'id',
                    id: '$ROOT_QUERY.author',
                    generated: true,
                },
            },
        };
        var expStoreWithId = {
            'Author__129': {
                firstName: 'John',
                lastName: 'Smith',
                id: '129',
                __typename: 'Author',
            },
            ROOT_QUERY: {
                author: {
                    type: 'id',
                    id: 'Author__129',
                    generated: false,
                },
            },
        };
        var storeWithoutId = writeToStore_1.writeQueryToStore({
            result: dataWithoutId,
            query: queryWithoutId,
            dataIdFromObject: dataIdFromObject,
        });
        chai_1.assert.deepEqual(storeWithoutId, expStoreWithoutId);
        var storeWithId = writeToStore_1.writeQueryToStore({
            result: dataWithId,
            query: queryWithId,
            store: storeWithoutId,
            dataIdFromObject: dataIdFromObject,
        });
        chai_1.assert.deepEqual(storeWithId, expStoreWithId);
        var _a, _b;
    });
    it('throw an error if a variable is not provided', function () {
        var testData = [
            {
                mutation: (_a = ["mutation mut($v: ID) { mut(v: $v) { id } }"], _a.raw = ["mutation mut($v: ID) { mut(v: $v) { id } }"], graphql_tag_1.default(_a)),
                variables: { not_the_proper_variable_name: '1' },
                expected: /The inline argument "v" is expected as a variable but was not provided./,
            },
        ];
        var result = { mut: { id: '1' } };
        function isOperationDefinition(value) {
            return value.kind === 'OperationDefinition';
        }
        testData.forEach(function (_a) {
            var mutation = _a.mutation, variables = _a.variables, expected = _a.expected;
            mutation.definitions.map(function (def) {
                chai_1.assert.throws(function () {
                    if (isOperationDefinition(def)) {
                        writeToStore_1.writeSelectionSetToStore({
                            dataId: '5',
                            selectionSet: def.selectionSet,
                            result: cloneDeep(result),
                            context: {
                                store: {},
                                variables: variables,
                                dataIdFromObject: function () { return '5'; },
                            },
                        });
                    }
                    else {
                        throw 'No operation definition found';
                    }
                }, expected);
            });
        });
        var _a;
    });
    it('does not swallow errors other than field errors', function () {
        var query = (_a = ["\n      query {\n        ...notARealFragment\n        fortuneCookie\n      }"], _a.raw = ["\n      query {\n        ...notARealFragment\n        fortuneCookie\n      }"], graphql_tag_1.default(_a));
        var result = {
            fortuneCookie: 'Star Wars unit tests are boring',
        };
        chai_1.assert.throws(function () {
            writeToStore_1.writeQueryToStore({
                result: result,
                query: query,
            });
        }, /No fragment/);
        var _a;
    });
    it('does not change object references if the value is the same', function () {
        var query = (_a = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField\n      }\n    "], _a.raw = ["\n      {\n        id,\n        stringField,\n        numberField,\n        nullField\n      }\n    "], graphql_tag_1.default(_a));
        var result = {
            id: 'abcd',
            stringField: 'This is a string!',
            numberField: 5,
            nullField: null,
        };
        var store = writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
        });
        var newStore = writeToStore_1.writeQueryToStore({
            query: query,
            result: cloneDeep(result),
            store: assign({}, store),
        });
        Object.keys(store).forEach(function (field) {
            chai_1.assert.equal(store[field], newStore[field], 'references are the same');
        });
        var _a;
    });
});
//# sourceMappingURL=writeToStore.js.map