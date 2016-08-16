"use strict";
var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
var src_1 = require('../src');
var redux_todomvc_1 = require('./fixtures/redux-todomvc');
var graphql_tag_1 = require('graphql-tag');
var printer_1 = require('graphql-tag/printer');
var redux_1 = require('redux');
var store_1 = require('../src/store');
var QueryManager_1 = require('../src/QueryManager');
var networkInterface_1 = require('../src/networkInterface');
var queryTransform_1 = require('../src/queries/queryTransform');
var fetchMiddleware_1 = require('../src/data/fetchMiddleware');
var mockNetworkInterface_1 = require('./mocks/mockNetworkInterface');
var getFromAST_1 = require('../src/queries/getFromAST');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
src_1.disableFragmentWarnings();
describe('client', function () {
    it('does not require any arguments and creates store lazily', function () {
        var client = new src_1.default();
        assert.isUndefined(client.store);
        client.initStore();
        assert.isDefined(client.store);
        assert.isDefined(client.store.getState().apollo);
    });
    it('can be loaded via require', function () {
        var ApolloClientRequire = require('../src').default;
        var client = new ApolloClientRequire();
        assert.isUndefined(client.store);
        client.initStore();
        assert.isDefined(client.store);
        assert.isDefined(client.store.getState().apollo);
    });
    it('can allow passing in a network interface', function () {
        var networkInterface = networkInterface_1.createNetworkInterface('swapi');
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        assert.equal(client.networkInterface._uri, networkInterface._uri);
    });
    it('can allow passing in a store', function () {
        var client = new src_1.default();
        var store = redux_1.createStore(redux_1.combineReducers({
            todos: redux_todomvc_1.rootReducer,
            apollo: client.reducer(),
        }), redux_1.applyMiddleware(client.middleware()));
        assert.deepEqual(client.store.getState(), store.getState());
    });
    it('throws an error if you pass in a store without apolloReducer', function () {
        try {
            var client = new src_1.default();
            redux_1.createStore(redux_1.combineReducers({
                todos: redux_todomvc_1.rootReducer,
            }), redux_1.applyMiddleware(client.middleware()));
            assert.fail();
        }
        catch (error) {
            assert.equal(error.message, 'Existing store does not use apolloReducer for apollo');
        }
    });
    it('has a top level key by default', function () {
        var client = new src_1.default();
        client.initStore();
        assert.deepEqual(client.store.getState(), {
            apollo: {
                queries: {},
                mutations: {},
                data: {},
                optimistic: [],
            },
        });
    });
    it('can allow passing in a top level key', function () {
        var reduxRootKey = 'test';
        var client = new src_1.default({
            reduxRootKey: reduxRootKey,
        });
        client.initStore();
        assert.deepEqual(client.store.getState(), (_a = {},
            _a[reduxRootKey] = {
                queries: {},
                mutations: {},
                data: {},
                optimistic: [],
            },
            _a
        ));
        var _a;
    });
    it('should allow for a single query to take place', function () {
        var query = (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            allPeople: {
                people: [
                    {
                        name: 'Luke Skywalker',
                    },
                ],
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: data },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        return client.query({ query: query })
            .then(function (result) {
            assert.deepEqual(result.data, data);
        });
        var _a;
    });
    it('should allow for a single query with existing store', function () {
        var query = (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            allPeople: {
                people: [
                    {
                        name: 'Luke Skywalker',
                    },
                ],
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: data },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        redux_1.createStore(redux_1.combineReducers({
            todos: redux_todomvc_1.rootReducer,
            apollo: client.reducer(),
        }), redux_1.applyMiddleware(client.middleware()));
        return client.query({ query: query })
            .then(function (result) {
            assert.deepEqual(result.data, data);
        });
        var _a;
    });
    it('can allow a custom top level key', function () {
        var query = (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            allPeople: {
                people: [
                    {
                        name: 'Luke Skywalker',
                    },
                ],
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: data },
        });
        var reduxRootKey = 'test';
        var client = new src_1.default({
            networkInterface: networkInterface,
            reduxRootKey: reduxRootKey,
        });
        return client.query({ query: query })
            .then(function (result) {
            assert.deepEqual(result.data, data);
        });
        var _a;
    });
    it('can allow the store to be rehydrated from the server', function () {
        var query = (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            allPeople: {
                people: [
                    {
                        name: 'Luke Skywalker',
                    },
                ],
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: data },
        });
        var initialState = {
            apollo: {
                queries: {
                    '0': {
                        queryString: printer_1.print(query),
                        query: {
                            id: 'ROOT_QUERY',
                            typeName: 'Query',
                            selectionSet: query.definitions[0].selectionSet,
                        },
                        minimizedQueryString: null,
                        minimizedQuery: null,
                        variables: undefined,
                        loading: false,
                        networkError: null,
                        graphQLErrors: null,
                        forceFetch: false,
                        fragmentMap: {},
                        returnPartialData: false,
                        lastRequestId: 1,
                    },
                },
                mutations: {},
                data: {
                    'ROOT_QUERY.allPeople({"first":"1"}).people.0': {
                        name: 'Luke Skywalker',
                    },
                    'ROOT_QUERY.allPeople({"first":1})': {
                        people: ['ROOT_QUERY.allPeople({"first":"1"}).people.0'],
                    },
                    ROOT_QUERY: {
                        'allPeople({"first":1})': {
                            type: 'id',
                            id: 'ROOT_QUERY.allPeople({"first":1})',
                            generated: true,
                        },
                    },
                },
                optimistic: [],
            },
        };
        var client = new src_1.default({
            networkInterface: networkInterface,
            initialState: initialState,
        });
        return client.query({ query: query })
            .then(function (result) {
            assert.deepEqual(result.data, data);
            assert.deepEqual(initialState, client.store.getState());
        });
        var _a;
    });
    it('allows for a single query with existing store and custom key', function () {
        var reduxRootKey = 'test';
        var query = (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            allPeople: {
                people: [
                    {
                        name: 'Luke Skywalker',
                    },
                ],
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: data },
        });
        var client = new src_1.default({
            reduxRootKey: reduxRootKey,
            networkInterface: networkInterface,
        });
        redux_1.createStore(redux_1.combineReducers((_b = {
                todos: redux_todomvc_1.rootReducer
            },
            _b[reduxRootKey] = client.reducer(),
            _b
        )), redux_1.applyMiddleware(client.middleware()));
        return client.query({ query: query })
            .then(function (result) {
            assert.deepEqual(result.data, data);
        });
        var _a, _b;
    });
    it('should return errors correctly for a single query', function () {
        var query = (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var errors = [
            {
                name: 'test',
                message: 'Syntax Error GraphQL request (8:9) Expected Name, found EOF',
            },
        ];
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { errors: errors },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        return client.query({ query: query })
            .catch(function (error) {
            var apolloError = error;
            assert.deepEqual(apolloError.graphQLErrors, errors);
        });
        var _a;
    });
    it('should allow for subscribing to a request', function (done) {
        var query = (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            allPeople: {
                people: [
                    {
                        name: 'Luke Skywalker',
                    },
                ],
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: data },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        var handle = client.watchQuery({ query: query });
        handle.subscribe({
            next: function (result) {
                assert.deepEqual(result.data, data);
                done();
            },
        });
        var _a;
    });
    it('should be able to transform queries', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var transformedQuery = (_b = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n        }\n      }"], graphql_tag_1.default(_b));
        var result = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
            },
        };
        var transformedResult = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
                '__typename': 'Author',
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: result },
        }, {
            request: { query: transformedQuery },
            result: { data: transformedResult },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
            queryTransformer: queryTransform_1.addTypenameToSelectionSet,
        });
        client.query({ query: query }).then(function (actualResult) {
            assert.deepEqual(actualResult.data, transformedResult);
            done();
        });
        var _a, _b;
    });
    it('should be able to transform queries on forced fetches', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var transformedQuery = (_b = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n        }\n      }"], graphql_tag_1.default(_b));
        var result = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
            },
        };
        var transformedResult = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
                '__typename': 'Author',
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: result },
        }, {
            request: { query: transformedQuery },
            result: { data: transformedResult },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
            queryTransformer: queryTransform_1.addTypenameToSelectionSet,
        });
        client.query({ forceFetch: true, query: query }).then(function (actualResult) {
            assert.deepEqual(actualResult.data, transformedResult);
            done();
        });
        var _a, _b;
    });
    it('should handle named fragments on mutations', function (done) {
        var mutation = (_a = ["\n      mutation {\n        starAuthor(id: 12) {\n          author {\n            ...authorDetails\n          }\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      mutation {\n        starAuthor(id: 12) {\n          author {\n            ...authorDetails\n          }\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_a));
        var result = {
            'starAuthor': {
                'author': {
                    'firstName': 'John',
                    'lastName': 'Smith',
                },
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: mutation },
            result: { data: result },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        client.mutate({ mutation: mutation }).then(function (actualResult) {
            assert.deepEqual(actualResult.data, result);
            done();
        });
        var _a;
    });
    it('should be able to handle named fragments on forced fetches', function (done) {
        var query = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      query {\n        author {\n          ...authorDetails\n        }\n      }"], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      query {\n        author {\n          ...authorDetails\n        }\n      }"], graphql_tag_1.default(_a));
        var result = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: result },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        client.query({ forceFetch: true, query: query }).then(function (actualResult) {
            assert.deepEqual(actualResult.data, result);
            done();
        });
        var _a;
    });
    it('should be able to handle named fragments with multiple fragments', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreDetails on Author {\n        address\n      }"], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreDetails on Author {\n        address\n      }"], graphql_tag_1.default(_a));
        var result = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
                'address': '1337 10th St.',
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: result },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        client.query({ query: query }).then(function (actualResult) {
            assert.deepEqual(actualResult.data, result);
            done();
        });
        var _a;
    });
    it('should be able to handle named fragments', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_a));
        var result = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
            },
        };
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: result },
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        client.query({ query: query }).then(function (actualResult) {
            assert.deepEqual(actualResult.data, result);
            done();
        });
        var _a;
    });
    describe('directives', function () {
        it('should reject the query promise if skipped data arrives in the result', function (done) {
            var query = (_a = ["\n        query {\n          fortuneCookie @skip(if: true)\n          otherThing\n        }"], _a.raw = ["\n        query {\n          fortuneCookie @skip(if: true)\n          otherThing\n        }"], graphql_tag_1.default(_a));
            var result = {
                fortuneCookie: 'you will go far',
                otherThing: 'false',
            };
            var networkInterface = mockNetworkInterface_1.default({
                request: { query: query },
                result: { data: result },
            });
            var client = new src_1.default({
                networkInterface: networkInterface,
            });
            client.store = store_1.createApolloStore({ reportCrashes: false });
            client.queryManager = new QueryManager_1.QueryManager({
                networkInterface: networkInterface,
                store: client.store,
                reduxRootKey: 'apollo',
            });
            client.query({ query: query }).then(function () {
            }).catch(function (error) {
                assert.include(error.message, 'Found extra field');
                done();
            });
            var _a;
        });
    });
    it('should send operationName along with the query to the server', function (done) {
        var query = (_a = ["\n      query myQueryName {\n        fortuneCookie\n      }"], _a.raw = ["\n      query myQueryName {\n        fortuneCookie\n      }"], graphql_tag_1.default(_a));
        var data = {
            'fortuneCookie': 'The waiter spit in your food',
        };
        var networkInterface = {
            query: function (request) {
                assert.equal(request.operationName, 'myQueryName');
                return Promise.resolve({ data: data });
            },
        };
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        client.query({ query: query }).then(function (actualResult) {
            assert.deepEqual(actualResult.data, data);
            done();
        });
        var _a;
    });
    describe('store fetch middleware (with cachedFetchById)', function () {
        var fetchAll, fetchOne, fetchMany, tasks, flatTasks, client, requests;
        beforeEach(function () {
            fetchAll = (_a = ["\n        query fetchAll {\n          tasks {\n            id\n            name\n          }\n        }\n      "], _a.raw = ["\n        query fetchAll {\n          tasks {\n            id\n            name\n          }\n        }\n      "], graphql_tag_1.default(_a));
            fetchOne = (_b = ["\n        query fetchOne($taskId: ID!) {\n          task(id: $taskId) {\n            id\n            name\n          }\n        }\n      "], _b.raw = ["\n        query fetchOne($taskId: ID!) {\n          task(id: $taskId) {\n            id\n            name\n          }\n        }\n      "], graphql_tag_1.default(_b));
            fetchMany = (_c = ["\n        query fetchMany($taskIds: [ID]!) {\n          tasks(ids: $taskIds) {\n            id\n            name\n          }\n        }\n      "], _c.raw = ["\n        query fetchMany($taskIds: [ID]!) {\n          tasks(ids: $taskIds) {\n            id\n            name\n          }\n        }\n      "], graphql_tag_1.default(_c));
            tasks = {
                abc123: { id: 'abc123', name: 'Do stuff' },
                def456: { id: 'def456', name: 'Do things' },
            };
            flatTasks = Object.keys(tasks).map(function (k) { return tasks[k]; });
            requests = [];
            var networkInterface = {
                query: function (request) {
                    return new Promise(function (resolve) {
                        requests.push(request);
                        if (request.operationName === 'fetchAll') {
                            resolve({ data: { tasks: flatTasks } });
                        }
                        else if (request.operationName === 'fetchMany') {
                            var ids = request.variables['taskIds'];
                            resolve({ data: { tasks: ids.map(function (i) { return tasks[i] || null; }) } });
                        }
                        else if (request.operationName === 'fetchOne') {
                            resolve({ data: { task: tasks[request.variables['taskId']] || null } });
                        }
                    });
                },
            };
            client = new src_1.default({
                networkInterface: networkInterface,
                dataIdFromObject: function (value) { return value.id; },
                storeFetchMiddleware: fetchMiddleware_1.cachedFetchById,
            });
            var _a, _b, _c;
        });
        it('should support directly querying with an empty cache', function () {
            return client.query({ query: fetchOne, variables: { taskId: 'abc123' } })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { task: tasks['abc123'] });
                assert.deepEqual(requests.map(function (r) { return r.operationName; }), ['fetchOne']);
            });
        });
        it('should support directly querying with cache lookups', function () {
            return client.query({ query: fetchOne, variables: { taskId: 'abc123' } })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { task: tasks['abc123'] });
                return client.query({ query: fetchOne, variables: { taskId: 'abc123' } });
            })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { task: tasks['abc123'] });
                assert.deepEqual(requests.map(function (r) { return r.operationName; }), ['fetchOne']);
            });
        });
        it('should support rewrites from other queries', function () {
            return client.query({ query: fetchAll })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { tasks: flatTasks });
                return client.query({ query: fetchOne, variables: { taskId: 'abc123' } });
            })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { task: tasks['abc123'] });
                assert.deepEqual(requests.map(function (r) { return r.operationName; }), ['fetchAll']);
            });
        });
        it('should handle cache misses when rewriting', function () {
            return client.query({ query: fetchAll })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { tasks: flatTasks });
                return client.query({ query: fetchOne, variables: { taskId: 'badid' } });
            })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { task: null });
                assert.deepEqual(requests.map(function (r) { return r.operationName; }), ['fetchAll', 'fetchOne']);
            });
        });
        it('should handle bulk fetching from cache', function () {
            return client.query({ query: fetchAll })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { tasks: flatTasks });
                return client.query({ query: fetchMany, variables: { taskIds: ['def456', 'abc123'] } });
            })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { tasks: [tasks['def456'], tasks['abc123']] });
                assert.deepEqual(requests.map(function (r) { return r.operationName; }), ['fetchAll']);
            });
        });
        it('should handle cache misses when bulk fetching', function () {
            return client.query({ query: fetchAll })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { tasks: flatTasks });
                return client.query({ query: fetchMany, variables: { taskIds: ['def456', 'badid'] } });
            })
                .then(function (actualResult) {
                assert.deepEqual(actualResult.data, { tasks: [tasks['def456'], null] });
                assert.deepEqual(requests.map(function (r) { return r.operationName; }), ['fetchAll', 'fetchMany']);
            });
        });
    });
    it('should send operationName along with the mutation to the server', function (done) {
        var mutation = (_a = ["\n      mutation myMutationName {\n        fortuneCookie\n      }"], _a.raw = ["\n      mutation myMutationName {\n        fortuneCookie\n      }"], graphql_tag_1.default(_a));
        var data = {
            'fortuneCookie': 'The waiter spit in your food',
        };
        var networkInterface = {
            query: function (request) {
                assert.equal(request.operationName, 'myMutationName');
                return Promise.resolve({ data: data });
            },
        };
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        client.mutate({ mutation: mutation }).then(function (actualResult) {
            assert.deepEqual(actualResult.data, data);
            done();
        });
        var _a;
    });
    describe('accepts dataIdFromObject option', function () {
        var query = (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            id\n            name\n          }\n        }\n      }\n    "], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            id\n            name\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            allPeople: {
                people: [
                    {
                        id: '1',
                        name: 'Luke Skywalker',
                    },
                ],
            },
        };
        it('for internal store', function () {
            var networkInterface = mockNetworkInterface_1.default({
                request: { query: query },
                result: { data: data },
            });
            var client = new src_1.default({
                networkInterface: networkInterface,
                dataIdFromObject: function (obj) { return obj.id; },
            });
            return client.query({ query: query })
                .then(function (result) {
                assert.deepEqual(result.data, data);
                assert.deepEqual(client.store.getState()['apollo'].data['1'], {
                    id: '1',
                    name: 'Luke Skywalker',
                });
            });
        });
        it('for existing store', function () {
            var networkInterface = mockNetworkInterface_1.default({
                request: { query: query },
                result: { data: data },
            });
            var client = new src_1.default({
                networkInterface: networkInterface,
                dataIdFromObject: function (obj) { return obj.id; },
            });
            var store = redux_1.createStore(redux_1.combineReducers({
                apollo: client.reducer(),
            }), redux_1.applyMiddleware(client.middleware()));
            return client.query({ query: query })
                .then(function (result) {
                assert.deepEqual(result.data, data);
                assert.deepEqual(store.getState()['apollo'].data['1'], {
                    id: '1',
                    name: 'Luke Skywalker',
                });
            });
        });
        var _a;
    });
    describe('forceFetch', function () {
        var query = (_a = ["\n      query number {\n        myNumber {\n          n\n        }\n      }\n    "], _a.raw = ["\n      query number {\n        myNumber {\n          n\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var firstFetch = {
            myNumber: {
                n: 1,
            },
        };
        var secondFetch = {
            myNumber: {
                n: 2,
            },
        };
        var networkInterface;
        var clock;
        beforeEach(function () {
            networkInterface = mockNetworkInterface_1.default({
                request: { query: query },
                result: { data: firstFetch },
            }, {
                request: { query: query },
                result: { data: secondFetch },
            });
        });
        afterEach(function () {
            if (clock) {
                clock.restore();
            }
        });
        it('forces the query to rerun', function () {
            var client = new src_1.default({
                networkInterface: networkInterface,
            });
            return client.query({ query: query })
                .then(function () { return client.query({ query: query, forceFetch: true }); })
                .then(function (result) {
                assert.deepEqual(result.data, { myNumber: { n: 2 } });
            });
        });
        it('can be disabled with ssrMode', function () {
            var client = new src_1.default({
                networkInterface: networkInterface,
                ssrMode: true,
            });
            var options = { query: query, forceFetch: true };
            return client.query({ query: query })
                .then(function () { return client.query(options); })
                .then(function (result) {
                assert.deepEqual(result.data, { myNumber: { n: 1 } });
                assert.deepEqual(options, { query: query, forceFetch: true });
            });
        });
        it('can temporarily be disabled with ssrForceFetchDelay', function () {
            clock = sinon.useFakeTimers();
            var client = new src_1.default({
                networkInterface: networkInterface,
                ssrForceFetchDelay: 100,
            });
            var outerPromise = client.query({ query: query })
                .then(function () {
                var promise = client.query({ query: query, forceFetch: true });
                clock.tick(0);
                return promise;
            })
                .then(function (result) {
                assert.deepEqual(result.data, { myNumber: { n: 1 } });
                clock.tick(100);
                var promise = client.query({ query: query, forceFetch: true });
                clock.tick(0);
                return promise;
            })
                .then(function (result) {
                assert.deepEqual(result.data, { myNumber: { n: 2 } });
            });
            clock.tick(0);
            return outerPromise;
        });
        var _a;
    });
    it('should expose a method called printAST that is prints graphql queries', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie\n      }"], _a.raw = ["\n      query {\n        fortuneCookie\n      }"], graphql_tag_1.default(_a));
        assert.equal(src_1.printAST(query), printer_1.print(query));
        var _a;
    });
    describe('fragment referencing', function () {
        afterEach(function () {
            src_1.clearFragmentDefinitions();
        });
        it('should return a fragment def with a unique name', function () {
            var fragment = (_a = ["\n        fragment authorDetails on Author {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "], _a.raw = ["\n        fragment authorDetails on Author {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "], graphql_tag_1.default(_a));
            var fragmentDefs = src_1.createFragment(fragment);
            assert.equal(fragmentDefs.length, 1);
            assert.equal(printer_1.print(fragmentDefs[0]), printer_1.print(getFromAST_1.getFragmentDefinitions(fragment)[0]));
            var _a;
        });
        it('should correctly return multiple fragments from a single document', function () {
            var fragmentDoc = (_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment personDetails on Person {\n          name\n        }\n        "], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment personDetails on Person {\n          name\n        }\n        "], graphql_tag_1.default(_a));
            var fragmentDefs = src_1.createFragment(fragmentDoc);
            assert.equal(fragmentDefs.length, 2);
            var expFragmentDefs = getFromAST_1.getFragmentDefinitions(fragmentDoc);
            assert.equal(printer_1.print(fragmentDefs[0]), printer_1.print(expFragmentDefs[0]));
            assert.equal(printer_1.print(fragmentDefs[1]), printer_1.print(expFragmentDefs[1]));
            var _a;
        });
        it('should correctly return fragment defs with one fragment depending on another', function () {
            var fragmentDoc = (_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n          ...otherAuthorDetails\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n          ...otherAuthorDetails\n        }"], graphql_tag_1.default(_a));
            var otherFragmentDoc = (_b = ["\n        fragment otherFragmentDoc on Author {\n          address\n        }"], _b.raw = ["\n        fragment otherFragmentDoc on Author {\n          address\n        }"], graphql_tag_1.default(_b));
            var fragmentDefs = src_1.createFragment(fragmentDoc, getFromAST_1.getFragmentDefinitions(otherFragmentDoc));
            assert.equal(fragmentDefs.length, 2);
            var expFragmentDefs = getFromAST_1.getFragmentDefinitions(otherFragmentDoc)
                .concat(getFromAST_1.getFragmentDefinitions(fragmentDoc));
            assert.deepEqual(fragmentDefs.map(printer_1.print), expFragmentDefs.map(printer_1.print));
            var _a, _b;
        });
        it('should return fragment defs with a multiple fragments depending on other fragments', function () {
            var fragmentDoc = (_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n          ...otherAuthorDetails\n        }\n\n        fragment onlineAuthorDetails on Author {\n          email\n          ...otherAuthorDetails\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n          ...otherAuthorDetails\n        }\n\n        fragment onlineAuthorDetails on Author {\n          email\n          ...otherAuthorDetails\n        }"], graphql_tag_1.default(_a));
            var otherFragmentDoc = (_b = ["\n        fragment otherAuthorDetails on Author {\n          address\n        }"], _b.raw = ["\n        fragment otherAuthorDetails on Author {\n          address\n        }"], graphql_tag_1.default(_b));
            var fragmentDefs = src_1.createFragment(fragmentDoc, getFromAST_1.getFragmentDefinitions(otherFragmentDoc));
            assert.equal(fragmentDefs.length, 3);
            var expFragmentDefs = getFromAST_1.getFragmentDefinitions(otherFragmentDoc)
                .concat(getFromAST_1.getFragmentDefinitions(fragmentDoc));
            assert.deepEqual(fragmentDefs.map(printer_1.print), expFragmentDefs.map(printer_1.print));
            var _a, _b;
        });
        it('should always return a flat array of fragment defs', function () {
            var fragmentDoc1 = (_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n          ...otherAuthorDetails\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n          ...otherAuthorDetails\n        }"], graphql_tag_1.default(_a));
            var fragmentDoc2 = (_b = ["\n        fragment otherAuthorDetails on Author {\n          address\n        }"], _b.raw = ["\n        fragment otherAuthorDetails on Author {\n          address\n        }"], graphql_tag_1.default(_b));
            var fragmentDoc3 = (_c = ["\n        fragment personDetails on Person {\n          personDetails\n        }"], _c.raw = ["\n        fragment personDetails on Person {\n          personDetails\n        }"], graphql_tag_1.default(_c));
            var fragments1 = src_1.createFragment(fragmentDoc1);
            var fragments2 = src_1.createFragment(fragmentDoc2);
            var fragments3 = src_1.createFragment(fragmentDoc3, [fragments1, fragments2]);
            assert.equal(fragments1.length, 1);
            assert.equal(fragments2.length, 1);
            assert.equal(fragments3.length, 3);
            var _a, _b, _c;
        });
        it('should add a fragment to the fragmentDefinitionsMap', function () {
            var fragmentDoc = (_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_a));
            src_1.createFragment(fragmentDoc);
            assert.equal(Object.keys(src_1.fragmentDefinitionsMap).length, 1);
            assert(src_1.fragmentDefinitionsMap.hasOwnProperty('authorDetails'));
            assert.equal(src_1.fragmentDefinitionsMap['authorDetails'].length, 1);
            assert.equal(printer_1.print(src_1.fragmentDefinitionsMap['authorDetails']), printer_1.print(getFromAST_1.getFragmentDefinitions(fragmentDoc)[0]));
            var _a;
        });
        it('should add fragments with the same name to fragmentDefinitionsMap + print warning', function () {
            var fragmentDoc = (_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment authorDetails on Author {\n          address\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment authorDetails on Author {\n          address\n        }"], graphql_tag_1.default(_a));
            var oldWarn = console.warn;
            console.warn = function (str, vals) {
                assert.include(str, 'Warning: fragment with name');
            };
            src_1.createFragment(fragmentDoc);
            assert.equal(Object.keys(src_1.fragmentDefinitionsMap).length, 1);
            assert.equal(src_1.fragmentDefinitionsMap['authorDetails'].length, 2);
            console.warn = oldWarn;
            var _a;
        });
        it('should issue a warning if we try query with a conflicting fragment name', function (done) {
            src_1.enableFragmentWarnings();
            var client = new src_1.default({
                networkInterface: mockNetworkInterface_1.default(),
            });
            var fragmentDoc = (_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_a));
            var queryDoc = (_b = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _b.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_b));
            src_1.createFragment(fragmentDoc);
            var oldWarn = console.warn;
            console.warn = function (str) {
                assert.include(str, 'Warning: fragment with name');
                console.warn = oldWarn;
                done();
            };
            client.query({ query: queryDoc });
            src_1.disableFragmentWarnings();
            var _a, _b;
        });
        it('should issue a warning if we try to watchQuery with a conflicting fragment name', function (done) {
            src_1.enableFragmentWarnings();
            var client = new src_1.default({
                networkInterface: mockNetworkInterface_1.default(),
            });
            var fragmentDoc = (_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_a));
            var queryDoc = (_b = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _b.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_b));
            src_1.createFragment(fragmentDoc);
            var oldWarn = console.warn;
            console.warn = function (str) {
                assert.include(str, 'Warning: fragment with name');
                console.warn = oldWarn;
                done();
            };
            client.watchQuery({ query: queryDoc });
            src_1.disableFragmentWarnings();
            var _a, _b;
        });
        it('should allow passing fragments to query', function (done) {
            var queryDoc = (_a = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }"], graphql_tag_1.default(_a));
            var composedQuery = (_b = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _b.raw = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_b));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var networkInterface = mockNetworkInterface_1.default({
                request: { query: composedQuery },
                result: { data: data },
            });
            var client = new src_1.default({
                networkInterface: networkInterface,
            });
            var fragmentDefs = src_1.createFragment((_c = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _c.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_c)));
            client.query({ query: queryDoc, fragments: fragmentDefs }).then(function (result) {
                assert.deepEqual(result.data, data);
                done();
            });
            var _a, _b, _c;
        });
        it('show allow passing fragments to mutate', function (done) {
            var mutationDoc = (_a = ["\n        mutation createAuthor {\n          createAuthor {\n            ...authorDetails\n          }\n        }"], _a.raw = ["\n        mutation createAuthor {\n          createAuthor {\n            ...authorDetails\n          }\n        }"], graphql_tag_1.default(_a));
            var composedMutation = (_b = ["\n        mutation createAuthor {\n          createAuthor {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _b.raw = ["\n        mutation createAuthor {\n          createAuthor {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_b));
            var data = {
                createAuthor: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var networkInterface = mockNetworkInterface_1.default({
                request: { query: composedMutation },
                result: { data: data },
            });
            var client = new src_1.default({
                networkInterface: networkInterface,
            });
            var fragmentDefs = src_1.createFragment((_c = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _c.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_c)));
            client.mutate({ mutation: mutationDoc, fragments: fragmentDefs }).then(function (result) {
                assert.deepEqual(result, { data: data });
                done();
            });
            var _a, _b, _c;
        });
        it('should allow passing fragments to watchQuery', function (done) {
            var queryDoc = (_a = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }"], graphql_tag_1.default(_a));
            var composedQuery = (_b = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _b.raw = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_b));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var networkInterface = mockNetworkInterface_1.default({
                request: { query: composedQuery },
                result: { data: data },
            });
            var client = new src_1.default({
                networkInterface: networkInterface,
            });
            var fragmentDefs = src_1.createFragment((_c = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _c.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_c)));
            var observer = client.watchQuery({ query: queryDoc, fragments: fragmentDefs });
            observer.subscribe({
                next: function (result) {
                    assert.deepEqual(result.data, data);
                    done();
                },
            });
            var _a, _b, _c;
        });
        it('should allow referencing named fragments with batching + merging turned on', function (done) {
            var personDetails = src_1.createFragment((_a = ["\n        fragment personDetails on Person {\n          firstName\n          lastName\n        }"], _a.raw = ["\n        fragment personDetails on Person {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_a)));
            var query1 = (_b = ["\n        query personInfo {\n          person {\n            ...personDetails\n          }\n        }"], _b.raw = ["\n        query personInfo {\n          person {\n            ...personDetails\n          }\n        }"], graphql_tag_1.default(_b));
            var query2 = (_c = ["\n        query authorPopularity {\n          author {\n            popularity\n          }\n        }"], _c.raw = ["\n        query authorPopularity {\n          author {\n            popularity\n          }\n        }"], graphql_tag_1.default(_c));
            var data1 = {
                person: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var data2 = {
                author: {
                    popularity: 0.9,
                },
            };
            var composedQuery = (_d = ["\n        query ___composed {\n          ___personInfo___requestIndex_0___fieldIndex_0: person {\n            ...___personInfo___requestIndex_0___personDetails\n          }\n\n          ___authorPopularity___requestIndex_1___fieldIndex_0: author {\n            popularity\n          }\n        }\n        fragment ___personInfo___requestIndex_0___personDetails on Person {\n          ___personInfo___requestIndex_0___fieldIndex_1: firstName\n          ___personInfo___requestIndex_0___fieldIndex_2: lastName\n        }"], _d.raw = ["\n        query ___composed {\n          ___personInfo___requestIndex_0___fieldIndex_0: person {\n            ...___personInfo___requestIndex_0___personDetails\n          }\n\n          ___authorPopularity___requestIndex_1___fieldIndex_0: author {\n            popularity\n          }\n        }\n        fragment ___personInfo___requestIndex_0___personDetails on Person {\n          ___personInfo___requestIndex_0___fieldIndex_1: firstName\n          ___personInfo___requestIndex_0___fieldIndex_2: lastName\n        }"], graphql_tag_1.default(_d));
            var composedResult = {
                ___personInfo___requestIndex_0___fieldIndex_0: {
                    ___personInfo___requestIndex_0___fieldIndex_1: 'John',
                    ___personInfo___requestIndex_0___fieldIndex_2: 'Smith',
                },
                ___authorPopularity___requestIndex_1___fieldIndex_0: data2.author,
            };
            var networkInterface = networkInterface_1.addQueryMerging(mockNetworkInterface_1.default({
                request: { query: composedQuery, debugName: '___composed' },
                result: { data: composedResult },
            }));
            var client = new src_1.default({
                networkInterface: networkInterface,
                shouldBatch: true,
            });
            var promise1 = client.query({ query: query1, fragments: personDetails });
            client.query({ query: query2 });
            promise1.then(function (result) {
                assert.deepEqual(result.data, data1);
                done();
            });
            var _a, _b, _c, _d;
        });
        it('should allow passing fragments in polling queries', function (done) {
            var queryDoc = (_a = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }"], graphql_tag_1.default(_a));
            var composedQuery = (_b = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _b.raw = ["\n        query {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_b));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var networkInterface = mockNetworkInterface_1.default({
                request: { query: composedQuery },
                result: { data: data },
            });
            var client = new src_1.default({
                networkInterface: networkInterface,
            });
            var fragmentDefs = src_1.createFragment((_c = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _c.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_c)));
            var observer = client.watchQuery({ query: queryDoc, pollInterval: 30, fragments: fragmentDefs });
            var subscription = observer.subscribe({
                next: function (result) {
                    assert.deepEqual(result.data, data);
                    subscription.unsubscribe();
                    done();
                },
            });
            var _a, _b, _c;
        });
        it('should not print a warning if we call disableFragmentWarnings', function (done) {
            var oldWarn = console.warn;
            console.warn = function (str) {
                done(new Error('Returned a warning despite calling disableFragmentWarnings'));
            };
            src_1.disableFragmentWarnings();
            src_1.createFragment((_a = ["\n        fragment authorDetails on Author {\n          firstName\n        }\n      "], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n        }\n      "], graphql_tag_1.default(_a)));
            src_1.createFragment((_b = ["\n        fragment authorDetails on Author {\n          lastName\n        }"], _b.raw = ["\n        fragment authorDetails on Author {\n          lastName\n        }"], graphql_tag_1.default(_b)));
            setTimeout(function () {
                console.warn = oldWarn;
                done();
            }, 100);
            var _a, _b;
        });
        it('should not add multiple instances of the same fragment to fragmentDefinitionsMap', function () {
            src_1.createFragment((_a = ["\n        fragment authorDetails on Author {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a)));
            src_1.createFragment((_b = ["\n        fragment authorDetails on Author {\n          author {\n            firstName\n            lastName\n          }\n        }"], _b.raw = ["\n        fragment authorDetails on Author {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_b)));
            assert(src_1.fragmentDefinitionsMap.hasOwnProperty('authorDetails'));
            assert.equal(src_1.fragmentDefinitionsMap['authorDetails'].length, 1);
            var _a, _b;
        });
        it('should not mutate the input document when querying', function () {
            var client = new src_1.default();
            var fragments = src_1.createFragment((_a = ["\n        fragment authorDetails on Author {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a)));
            var query = (_b = ["{ author { ...authorDetails } }"], _b.raw = ["{ author { ...authorDetails } }"], graphql_tag_1.default(_b));
            var initialDefinitions = query.definitions;
            client.query({ query: query, fragments: fragments });
            assert.equal(query.definitions, initialDefinitions);
            var _a, _b;
        });
    });
    it('should pass a network error correctly on a mutation', function (done) {
        var mutation = (_a = ["\n      mutation {\n        person {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      mutation {\n        person {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var data = {
            person: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var networkError = new Error('Some kind of network error.');
        var client = new src_1.default({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: mutation },
                result: { data: data },
                error: networkError,
            }),
        });
        client.mutate({ mutation: mutation }).then(function (result) {
            done(new Error('Returned a result when it should not have.'));
        }).catch(function (error) {
            var apolloError = error;
            assert(apolloError.networkError);
            assert.equal(apolloError.networkError.message, networkError.message);
            done();
        });
        var _a;
    });
    it('should pass a GraphQL error correctly on a mutation', function (done) {
        var mutation = (_a = ["\n      mutation {\n        newPerson {\n          person {\n            firstName\n            lastName\n          }\n        }\n      }"], _a.raw = ["\n      mutation {\n        newPerson {\n          person {\n            firstName\n            lastName\n          }\n        }\n      }"], graphql_tag_1.default(_a));
        var data = {
            person: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var errors = [new Error('Some kind of GraphQL error.')];
        var client = new src_1.default({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: mutation },
                result: { data: data, errors: errors },
            }),
        });
        client.mutate({ mutation: mutation }).then(function (result) {
            done(new Error('Returned a result when it should not have.'));
        }).catch(function (error) {
            var apolloError = error;
            assert(apolloError.graphQLErrors);
            assert.equal(apolloError.graphQLErrors.length, 1);
            assert.equal(apolloError.graphQLErrors[0].message, errors[0].message);
            done();
        });
        var _a;
    });
});
//# sourceMappingURL=client.js.map