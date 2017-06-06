var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { assert } from 'chai';
import mockNetworkInterface from './mocks/mockNetworkInterface';
import gql from 'graphql-tag';
import ApolloClient from '../src/ApolloClient';
import { cloneDeep } from '../src/util/cloneDeep';
describe('query cache', function () {
    var query = (_a = ["\n    query account {\n      node(id: \"account1\") {\n        id\n        name\n        owner {\n          id\n          name\n        }\n        users {\n          id\n          name\n        }\n      }\n    }\n  "], _a.raw = ["\n    query account {\n      node(id: \"account1\") {\n        id\n        name\n        owner {\n          id\n          name\n        }\n        users {\n          id\n          name\n        }\n      }\n    }\n  "], gql(_a));
    var data = {
        data: {
            node: {
                id: 'account1',
                name: 'Account 1',
                owner: {
                    id: 'user1',
                    name: 'User 1',
                },
                users: [
                    {
                        id: 'user1',
                        name: 'User 1',
                    },
                    {
                        id: 'user2',
                        name: 'User 2',
                    },
                ],
            },
        },
    };
    var initialState = {
        apollo: {
            data: {
                'ROOT_QUERY': {
                    'node({"id":"account1"})': {
                        'generated': false,
                        'id': 'account1',
                        'type': 'id',
                    },
                },
                'account1': {
                    'id': 'account1',
                    'name': 'Account 1',
                    'owner': {
                        'generated': false,
                        'id': 'user1',
                        'type': 'id',
                    },
                    'users': [
                        {
                            'generated': false,
                            'id': 'user1',
                            'type': 'id',
                        },
                        {
                            'generated': false,
                            'id': 'user2',
                            'type': 'id',
                        },
                    ],
                },
                'user1': {
                    'id': 'user1',
                    'name': 'User 1',
                },
                'user2': {
                    'id': 'user2',
                    'name': 'User 2',
                },
            },
        },
    };
    it('is inserted when provided initial state with data for query', function () {
        var networkInterface = mockNetworkInterface();
        var client = new ApolloClient({
            networkInterface: networkInterface,
            initialState: initialState,
            addTypename: false,
            dataIdFromObject: function (obj) { return obj.id; },
        });
        return client.query({ query: query, fetchPolicy: 'cache-only' })
            .then(function (result) {
            assert.deepEqual(result.data, data.data);
            assert.deepEqual(client.store.getState().apollo.cache, {
                data: initialState.apollo.data,
                queryCache: {
                    '1': {
                        state: 'fresh',
                        result: data.data,
                        variables: {},
                        keys: {
                            'ROOT_QUERY.node({"id":"account1"})': true,
                            'account1': true,
                            'user1': true,
                            'user2': true,
                        },
                    },
                },
            });
        });
    });
    it('is inserted after requesting a query over the network', function () {
        var networkInterface = mockNetworkInterface({
            request: { query: query },
            result: data,
        });
        var client = new ApolloClient({
            networkInterface: networkInterface,
            addTypename: false,
            dataIdFromObject: function (obj) { return obj.id; },
        });
        return client.query({ query: query })
            .then(function (result) {
            assert.deepEqual(result.data, data.data);
            assert.deepEqual(client.store.getState().apollo.cache, {
                data: initialState.apollo.data,
                queryCache: {
                    '1': {
                        state: 'fresh',
                        result: data.data,
                        variables: {},
                        keys: {
                            'ROOT_QUERY.node({"id":"account1"})': true,
                            'account1': true,
                            'user1': true,
                            'user2': true,
                        },
                    },
                },
            });
        });
    });
    describe('with mutation and update queries', function () {
        var mutation = (_a = ["\n        mutation dummyMutation {\n            id\n        }\n    "], _a.raw = ["\n        mutation dummyMutation {\n            id\n        }\n    "], gql(_a));
        var mutationResult = {
            data: {
                id: 'dummy',
            },
        };
        var setupClient = function (networkInterface) {
            networkInterface = networkInterface || mockNetworkInterface({
                request: { query: query },
                result: data,
            }, {
                request: { query: mutation },
                result: mutationResult,
            }, {
                request: { query: query },
                result: data,
            });
            return new ApolloClient({
                networkInterface: networkInterface,
                addTypename: false,
                dataIdFromObject: function (obj) { return obj.id; },
            });
        };
        it('is fresh with updateStoreFlag true', function (done) {
            var expectedData = cloneDeep(initialState.apollo.data);
            expectedData['ROOT_MUTATION'] = { id: 'dummy' };
            expectedData['account1'].name = 'Account 1 (updated)';
            var expectedResult = cloneDeep(data.data);
            expectedResult.node.name = 'Account 1 (updated)';
            var expectedCache = {
                data: expectedData,
                queryCache: {
                    '1': {
                        state: 'fresh',
                        result: expectedResult,
                        variables: {},
                        keys: {
                            'ROOT_QUERY.node({"id":"account1"})': true,
                            'account1': true,
                            'user1': true,
                            'user2': true,
                        },
                    },
                },
            };
            var client = setupClient();
            var c = 0;
            client.watchQuery({ query: query }).subscribe({
                next: function (result) {
                    switch (c++) {
                        case 0:
                            assert.deepEqual(result.data, data.data);
                            client.mutate({
                                mutation: mutation,
                                updateQueries: {
                                    account: function (prev) {
                                        var newData = cloneDeep(prev);
                                        newData.node.name = 'Account 1 (updated)';
                                        return newData;
                                    },
                                },
                            }).then(function () {
                                assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
                            });
                            break;
                        case 1:
                            assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
                            done();
                            break;
                        default:
                            done(new Error('`next` was called to many times.'));
                    }
                },
            });
        });
        it('is dirty with updateStoreFlag false and refetched after waking from standby', function (done) {
            var expectedData = cloneDeep(initialState.apollo.data);
            expectedData['ROOT_MUTATION'] = { id: 'dummy' };
            var expectedResult = cloneDeep(data.data);
            expectedResult.node.name = 'Account 1 (updated)';
            var expectedCache = {
                data: expectedData,
                queryCache: {
                    '1': {
                        state: 'dirty',
                        result: expectedResult,
                        variables: {},
                        keys: {
                            'ROOT_QUERY.node({"id":"account1"})': true,
                            'account1': true,
                            'user1': true,
                            'user2': true,
                        },
                    },
                },
            };
            var client = setupClient();
            var c = 0;
            var observable = client.watchQuery({ query: query });
            observable.subscribe({
                next: function (result) {
                    switch (c++) {
                        case 0:
                            assert.deepEqual(result.data, data.data);
                            client.mutate({
                                mutation: mutation,
                                updateQueries: {
                                    account: function (prev, options) {
                                        var newData = cloneDeep(prev);
                                        newData.node.name = 'Account 1 (updated)';
                                        options.updateStoreFlag = false;
                                        return newData;
                                    },
                                },
                            }).then(function () {
                                assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
                            });
                            break;
                        case 1:
                            assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
                            observable.setOptions({
                                fetchPolicy: 'standby',
                            });
                            observable.setOptions({
                                fetchPolicy: 'cache-first',
                            });
                            break;
                        case 2:
                            expectedCache = cloneDeep(expectedCache);
                            expectedCache.queryCache['1'].state = 'fresh';
                            expectedCache.queryCache['1'].result.node.name = data.data.node.name;
                            assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
                            done();
                            break;
                        default:
                            done(new Error('`next` was called to many times.'));
                    }
                },
            });
        });
        it('works with regexp and forceQueryCacheState', function () {
            var randomQuery = (_a = ["\n        query random {\n          random {\n            id\n            name\n          }\n        }\n      "], _a.raw = ["\n        query random {\n          random {\n            id\n            name\n          }\n        }\n      "], gql(_a));
            var randomQueryData = {
                data: {
                    random: {
                        id: 'random',
                        name: 'Random',
                    },
                },
            };
            var randomQuery2 = (_b = ["\n        query random2 {\n          random2 {\n            id\n            name\n          }\n        }\n      "], _b.raw = ["\n        query random2 {\n          random2 {\n            id\n            name\n          }\n        }\n      "], gql(_b));
            var randomQueryData2 = {
                data: {
                    random2: {
                        id: 'random2',
                        name: 'Random 2',
                    },
                },
            };
            var expectedData = __assign({}, initialState.apollo.data, { 'ROOT_QUERY': __assign({}, initialState.apollo.data.ROOT_QUERY, { 'random': {
                        'generated': false,
                        'id': 'random',
                        'type': 'id',
                    }, 'random2': {
                        'generated': false,
                        'id': 'random2',
                        'type': 'id',
                    } }), 'ROOT_MUTATION': { id: 'dummy' }, 'account1': __assign({}, initialState.apollo.data.account1, { 'name': 'Account 1 (updated)' }), 'random': {
                    'id': 'random',
                    'name': 'Random',
                }, 'random2': {
                    'id': 'random2',
                    'name': 'Random 2',
                } });
            var expectedCache = {
                data: expectedData,
                queryCache: {
                    '1': {
                        state: 'fresh',
                        result: {
                            node: __assign({}, data.data.node, { name: 'Account 1 (updated)' }),
                        },
                        variables: {},
                        keys: {
                            'ROOT_QUERY.node({"id":"account1"})': true,
                            'account1': true,
                            'user1': true,
                            'user2': true,
                        },
                    },
                    '3': {
                        state: 'dirty',
                        result: randomQueryData.data,
                        variables: {},
                        keys: {
                            'ROOT_QUERY.random': true,
                            'random': true,
                        },
                    },
                    '5': {
                        state: 'dirty',
                        result: randomQueryData2.data,
                        variables: {},
                        keys: {
                            'ROOT_QUERY.random2': true,
                            'random2': true,
                        },
                    },
                },
            };
            var client = setupClient(mockNetworkInterface({
                request: { query: query },
                result: data,
            }, {
                request: { query: randomQuery },
                result: randomQueryData,
            }, {
                request: { query: randomQuery2 },
                result: randomQueryData2,
            }, {
                request: { query: mutation },
                result: mutationResult,
            }));
            return Promise.all([
                new Promise(function (resolve, reject) {
                    var handle = client.watchQuery({ query: query });
                    handle.subscribe({
                        next: function (res) {
                            resolve(res);
                        },
                    });
                }),
                new Promise(function (resolve, reject) {
                    var handle = client.watchQuery({ query: randomQuery });
                    handle.subscribe({
                        next: function (res) {
                            resolve(res);
                        },
                    });
                }),
                new Promise(function (resolve, reject) {
                    var handle = client.watchQuery({ query: randomQuery2 });
                    handle.subscribe({
                        next: function (res) {
                            resolve(res);
                        },
                    });
                }),
            ])
                .then(function () {
                return client.mutate({
                    mutation: mutation,
                    updateQueries: {
                        account: function (prev, options) {
                            var newData = cloneDeep(prev);
                            newData.node.name = 'Account 1 (updated)';
                            return newData;
                        },
                        '/random/': function (prev, options) {
                            options.forceQueryCacheState = 'dirty';
                            return prev;
                        },
                    },
                });
            })
                .then(function () {
                assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
            });
            var _a, _b;
        });
        var _a;
    });
    var _a;
});
//# sourceMappingURL=queryCache.js.map