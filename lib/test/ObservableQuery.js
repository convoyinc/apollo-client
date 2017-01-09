"use strict";
var chai = require("chai");
var assert = chai.assert;
var sinon = require("sinon");
var graphql_tag_1 = require("graphql-tag");
var QueryManager_1 = require("../src/core/QueryManager");
var store_1 = require("../src/store");
var mockQueryManager_1 = require("./mocks/mockQueryManager");
var mockWatchQuery_1 = require("./mocks/mockWatchQuery");
var mockNetworkInterface_1 = require("./mocks/mockNetworkInterface");
var wrap_1 = require("./util/wrap");
var subscribeAndCount_1 = require("./util/subscribeAndCount");
var store_2 = require("../src/queries/store");
describe('ObservableQuery', function () {
    var query = (_a = ["\n    query query($id: ID!) {\n      people_one(id: $id) {\n        name\n      }\n    }\n  "], _a.raw = ["\n    query query($id: ID!) {\n      people_one(id: $id) {\n        name\n      }\n    }\n  "], graphql_tag_1.default(_a));
    var superQuery = (_b = ["\n    query superQuery($id: ID!) {\n      people_one(id: $id) {\n        name\n        age\n      }\n    }\n  "], _b.raw = ["\n    query superQuery($id: ID!) {\n      people_one(id: $id) {\n        name\n        age\n      }\n    }\n  "], graphql_tag_1.default(_b));
    var variables = { id: 1 };
    var differentVariables = { id: 2 };
    var dataOne = {
        people_one: {
            name: 'Luke Skywalker',
        },
    };
    var superDataOne = {
        people_one: {
            name: 'Luke Skywalker',
            age: 21,
        },
    };
    var dataTwo = {
        people_one: {
            name: 'Leia Skywalker',
        },
    };
    var error = {
        name: 'people_one',
        message: 'is offline.',
    };
    var defaultReduxRootSelector = function (state) { return state.apollo; };
    var createQueryManager = function (_a) {
        var networkInterface = _a.networkInterface, store = _a.store, reduxRootSelector = _a.reduxRootSelector, _b = _a.addTypename, addTypename = _b === void 0 ? false : _b;
        return new QueryManager_1.QueryManager({
            networkInterface: networkInterface || mockNetworkInterface_1.default(),
            store: store || store_1.createApolloStore(),
            reduxRootSelector: reduxRootSelector || defaultReduxRootSelector,
            addTypename: addTypename,
        });
    };
    describe('setOptions', function () {
        describe('to change pollInterval', function () {
            var timer;
            var defer = setImmediate;
            beforeEach(function () { return timer = sinon.useFakeTimers(); });
            afterEach(function () { return timer.restore(); });
            it('starts polling if goes from 0 -> something', function (done) {
                var manager = mockQueryManager_1.default({
                    request: { query: query, variables: variables },
                    result: { data: dataOne },
                }, {
                    request: { query: query, variables: variables },
                    result: { data: dataTwo },
                });
                var observable = manager.watchQuery({ query: query, variables: variables });
                subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                    if (handleCount === 1) {
                        assert.deepEqual(result.data, dataOne);
                        observable.setOptions({ pollInterval: 10 });
                        timer.tick(11);
                    }
                    else if (handleCount === 2) {
                        assert.deepEqual(result.data, dataTwo);
                        done();
                    }
                });
                timer.tick(0);
            });
            it('stops polling if goes from something -> 0', function (done) {
                var manager = mockQueryManager_1.default({
                    request: { query: query, variables: variables },
                    result: { data: dataOne },
                }, {
                    request: { query: query, variables: variables },
                    result: { data: dataTwo },
                });
                var observable = manager.watchQuery({
                    query: query,
                    variables: variables,
                    pollInterval: 10,
                });
                subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                    if (handleCount === 1) {
                        assert.deepEqual(result.data, dataOne);
                        observable.setOptions({ pollInterval: 0 });
                        timer.tick(100);
                        done();
                    }
                    else if (handleCount === 2) {
                        done(new Error('Should not get more than one result'));
                    }
                });
                timer.tick(0);
            });
            it('can change from x>0 to y>0', function (done) {
                var manager = mockQueryManager_1.default({
                    request: { query: query, variables: variables },
                    result: { data: dataOne },
                }, {
                    request: { query: query, variables: variables },
                    result: { data: dataTwo },
                });
                var observable = manager.watchQuery({
                    query: query,
                    variables: variables,
                    pollInterval: 100,
                });
                subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                    if (handleCount === 1) {
                        assert.deepEqual(result.data, dataOne);
                        defer(function () {
                            observable.setOptions({ pollInterval: 10 });
                            defer(function () {
                                timer.tick(11);
                            });
                        });
                    }
                    else if (handleCount === 2) {
                        assert.deepEqual(result.data, dataTwo);
                        done();
                    }
                });
                timer.tick(0);
            });
        });
        it('does not break refetch', function (done) {
            var queryWithVars = (_a = ["query people($first: Int) {\n        allPeople(first: $first) { people { name } }\n      }"], _a.raw = ["query people($first: Int) {\n        allPeople(first: $first) { people { name } }\n      }"], graphql_tag_1.default(_a));
            var data = { allPeople: { people: [{ name: 'Luke Skywalker' }] } };
            var variables1 = { first: 0 };
            var data2 = { allPeople: { people: [{ name: 'Leia Skywalker' }] } };
            var variables2 = { first: 1 };
            var observable = mockWatchQuery_1.default({
                request: { query: queryWithVars, variables: variables1 },
                result: { data: data },
            }, {
                request: { query: queryWithVars, variables: variables2 },
                result: { data: data2 },
            });
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 1) {
                    assert.deepEqual(result.data, data);
                    observable.setOptions({ forceFetch: false });
                    observable.refetch(variables2);
                }
                else if (handleCount === 3) {
                    assert.deepEqual(result.data, data2);
                    done();
                }
            });
            var _a;
        });
        it('does a network request if forceFetch becomes true', function (done) {
            var observable = mockWatchQuery_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
            }, {
                request: { query: query, variables: variables },
                result: { data: dataTwo },
            });
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 1) {
                    assert.deepEqual(result.data, dataOne);
                    observable.setOptions({ forceFetch: true });
                }
                else if (handleCount === 2) {
                    assert.deepEqual(result.data, dataTwo);
                    done();
                }
            });
        });
        it('does a network request if noFetch becomes true then store is reset then noFetch becomes false', function (done) {
            var queryManager = null;
            var observable = null;
            var testQuery = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var timesFired = 0;
            var networkInterface = {
                query: function (request) {
                    timesFired += 1;
                    return Promise.resolve({ data: data });
                },
            };
            queryManager = createQueryManager({ networkInterface: networkInterface });
            observable = queryManager.watchQuery({ query: testQuery });
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 1) {
                    assert.deepEqual(result.data, data);
                    assert.equal(timesFired, 1);
                    setTimeout(function () {
                        observable.setOptions({ noFetch: true });
                        queryManager.resetStore();
                    }, 0);
                }
                else if (handleCount === 2) {
                    assert.deepEqual(result.data, {});
                    assert.equal(timesFired, 1);
                    setTimeout(function () {
                        observable.setOptions({ noFetch: false });
                    }, 0);
                }
                else if (handleCount === 3) {
                    assert.deepEqual(result.data, data);
                    assert.equal(timesFired, 2);
                    done();
                }
            });
            var _a;
        });
        it('does a network request if noFetch becomes false', function (done) {
            var queryManager = null;
            var observable = null;
            var testQuery = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var timesFired = 0;
            var networkInterface = {
                query: function (request) {
                    timesFired += 1;
                    return Promise.resolve({ data: data });
                },
            };
            queryManager = createQueryManager({ networkInterface: networkInterface });
            observable = queryManager.watchQuery({ query: testQuery, noFetch: true });
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 2) {
                    assert.deepEqual(result.data, {});
                    assert.equal(timesFired, 0);
                    setTimeout(function () {
                        observable.setOptions({ noFetch: false });
                    }, 0);
                }
                else if (handleCount === 3) {
                    assert.deepEqual(result.data, data);
                    assert.equal(timesFired, 1);
                    done();
                }
            });
            var _a;
        });
    });
    describe('setVariables', function () {
        it('reruns query if the variables change', function (done) {
            var observable = mockWatchQuery_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
            }, {
                request: { query: query, variables: differentVariables },
                result: { data: dataTwo },
            });
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 1) {
                    assert.deepEqual(result.data, dataOne);
                    observable.setVariables(differentVariables);
                }
                else if (handleCount === 2) {
                    assert.isTrue(result.loading);
                    assert.deepEqual(result.data, dataOne);
                }
                else if (handleCount === 3) {
                    assert.isFalse(result.loading);
                    assert.deepEqual(result.data, dataTwo);
                    done();
                }
            });
        });
        it('sets networkStatus to `setVariables` when fetching', function (done) {
            var mockedResponses = [{
                    request: { query: query, variables: variables },
                    result: { data: dataOne },
                }, {
                    request: { query: query, variables: differentVariables },
                    result: { data: dataTwo },
                }];
            var queryManager = mockQueryManager_1.default.apply(void 0, mockedResponses);
            var firstRequest = mockedResponses[0].request;
            var observable = queryManager.watchQuery({
                query: firstRequest.query,
                variables: firstRequest.variables,
                notifyOnNetworkStatusChange: true,
            });
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 1) {
                    assert.deepEqual(result.data, dataOne);
                    assert.equal(result.networkStatus, store_2.NetworkStatus.ready);
                    observable.setVariables(differentVariables);
                }
                else if (handleCount === 2) {
                    assert.isTrue(result.loading);
                    assert.equal(result.networkStatus, store_2.NetworkStatus.setVariables);
                    assert.deepEqual(result.data, dataOne);
                }
                else if (handleCount === 3) {
                    assert.isFalse(result.loading);
                    assert.equal(result.networkStatus, store_2.NetworkStatus.ready);
                    assert.deepEqual(result.data, dataTwo);
                    done();
                }
            });
        });
        it('sets networkStatus to `setVariables` when calling refetch with new variables', function (done) {
            var mockedResponses = [{
                    request: { query: query, variables: variables },
                    result: { data: dataOne },
                }, {
                    request: { query: query, variables: differentVariables },
                    result: { data: dataTwo },
                }];
            var queryManager = mockQueryManager_1.default.apply(void 0, mockedResponses);
            var firstRequest = mockedResponses[0].request;
            var observable = queryManager.watchQuery({
                query: firstRequest.query,
                variables: firstRequest.variables,
                notifyOnNetworkStatusChange: true,
            });
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 1) {
                    assert.deepEqual(result.data, dataOne);
                    assert.equal(result.networkStatus, store_2.NetworkStatus.ready);
                    observable.refetch(differentVariables);
                }
                else if (handleCount === 2) {
                    assert.isTrue(result.loading);
                    assert.equal(result.networkStatus, store_2.NetworkStatus.setVariables);
                    assert.deepEqual(result.data, dataOne);
                }
                else if (handleCount === 3) {
                    assert.isFalse(result.loading);
                    assert.equal(result.networkStatus, store_2.NetworkStatus.ready);
                    assert.deepEqual(result.data, dataTwo);
                    done();
                }
            });
        });
        it('reruns observer callback if the variables change but data does not', function (done) {
            var observable = mockWatchQuery_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
            }, {
                request: { query: query, variables: differentVariables },
                result: { data: dataOne },
            });
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 1) {
                    assert.deepEqual(result.data, dataOne);
                    observable.setVariables(differentVariables);
                }
                else if (handleCount === 2) {
                    assert.isTrue(result.loading);
                    assert.deepEqual(result.data, dataOne);
                }
                else if (handleCount === 3) {
                    assert.deepEqual(result.data, dataOne);
                    done();
                }
            });
        });
        it('does not rerun observer callback if the variables change but new data is in store', function (done) {
            var manager = mockQueryManager_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
            }, {
                request: { query: query, variables: differentVariables },
                result: { data: dataOne },
            });
            manager.query({ query: query, variables: differentVariables })
                .then(function () {
                var observable = manager.watchQuery({ query: query, variables: variables });
                var errored = false;
                subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                    if (handleCount === 1) {
                        assert.deepEqual(result.data, dataOne);
                        observable.setVariables(differentVariables);
                        setTimeout(function () { return !errored && done(); }, 10);
                    }
                    else if (handleCount === 2) {
                        errored = true;
                        throw new Error('Observable callback should not fire twice');
                    }
                });
            });
        });
        it('does not rerun query if variables do not change', function (done) {
            var observable = mockWatchQuery_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
            }, {
                request: { query: query, variables: variables },
                result: { data: dataTwo },
            });
            var errored = false;
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 1) {
                    assert.deepEqual(result.data, dataOne);
                    observable.setVariables(variables);
                    setTimeout(function () { return !errored && done(); }, 10);
                }
                else if (handleCount === 2) {
                    errored = true;
                    throw new Error('Observable callback should not fire twice');
                }
            });
        });
        it('handles variables changing while a query is in-flight', function (done) {
            var observable = mockWatchQuery_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
                delay: 20,
            }, {
                request: { query: query, variables: differentVariables },
                result: { data: dataTwo },
                delay: 20,
            });
            setTimeout(function () { return observable.setVariables(differentVariables); }, 10);
            subscribeAndCount_1.default(done, observable, function (handleCount, result) {
                if (handleCount === 1) {
                    assert.equal(result.networkStatus, store_2.NetworkStatus.ready);
                    assert.isFalse(result.loading);
                    assert.deepEqual(result.data, dataTwo);
                    done();
                }
            });
        });
    });
    describe('currentResult', function () {
        it('returns the current query status immediately', function (done) {
            var observable = mockWatchQuery_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
                delay: 100,
            });
            subscribeAndCount_1.default(done, observable, function () {
                assert.deepEqual(observable.currentResult(), {
                    data: dataOne,
                    loading: false,
                    networkStatus: 7,
                });
                done();
            });
            assert.deepEqual(observable.currentResult(), {
                loading: true,
                data: {},
                networkStatus: 1,
            });
            setTimeout(wrap_1.default(done, function () {
                assert.deepEqual(observable.currentResult(), {
                    loading: true,
                    data: {},
                    networkStatus: 1,
                });
            }), 0);
        });
        it('returns results from the store immediately', function () {
            var queryManager = mockQueryManager_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
            });
            return queryManager.query({ query: query, variables: variables })
                .then(function (result) {
                assert.deepEqual(result, {
                    data: dataOne,
                    loading: false,
                    networkStatus: 7,
                });
                var observable = queryManager.watchQuery({
                    query: query,
                    variables: variables,
                });
                assert.deepEqual(observable.currentResult(), {
                    data: dataOne,
                    loading: false,
                    networkStatus: 7,
                });
            });
        });
        it('returns errors from the store immediately', function () {
            var queryManager = mockQueryManager_1.default({
                request: { query: query, variables: variables },
                result: { errors: [error] },
            });
            var observable = queryManager.watchQuery({
                query: query,
                variables: variables,
            });
            return observable.result()
                .catch(function (theError) {
                assert.deepEqual(theError.graphQLErrors, [error]);
                var currentResult = observable.currentResult();
                assert.equal(currentResult.loading, false);
                assert.deepEqual(currentResult.error.graphQLErrors, [error]);
            });
        });
        it('returns partial data from the store immediately', function (done) {
            var queryManager = mockQueryManager_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
            }, {
                request: { query: superQuery, variables: variables },
                result: { data: superDataOne },
            });
            queryManager.query({ query: query, variables: variables })
                .then(function (result) {
                var observable = queryManager.watchQuery({
                    query: superQuery,
                    variables: variables,
                    returnPartialData: true,
                });
                assert.deepEqual(observable.currentResult(), {
                    data: dataOne,
                    loading: true,
                    networkStatus: 1,
                });
                subscribeAndCount_1.default(done, observable, function (handleCount, subResult) {
                    assert.deepEqual(subResult, observable.currentResult());
                    if (handleCount === 1) {
                        assert.deepEqual(subResult, {
                            data: dataOne,
                            loading: true,
                            networkStatus: 1,
                        });
                    }
                    else if (handleCount === 2) {
                        assert.deepEqual(subResult, {
                            data: superDataOne,
                            loading: false,
                            networkStatus: 7,
                        });
                        done();
                    }
                });
            });
        });
        it('returns loading even if full data is available when force fetching', function (done) {
            var queryManager = mockQueryManager_1.default({
                request: { query: query, variables: variables },
                result: { data: dataOne },
            }, {
                request: { query: query, variables: variables },
                result: { data: dataTwo },
            });
            queryManager.query({ query: query, variables: variables })
                .then(function (result) {
                var observable = queryManager.watchQuery({
                    query: query,
                    variables: variables,
                    forceFetch: true,
                });
                assert.deepEqual(observable.currentResult(), {
                    data: dataOne,
                    loading: true,
                    networkStatus: 1,
                });
                subscribeAndCount_1.default(done, observable, function (handleCount, subResult) {
                    assert.deepEqual(subResult, observable.currentResult());
                    if (handleCount === 1) {
                        assert.deepEqual(subResult, {
                            data: dataTwo,
                            loading: false,
                            networkStatus: 7,
                        });
                        done();
                    }
                });
            });
        });
        describe('mutations', function () {
            var mutation = (_a = ["\n        mutation setName {\n          name\n        }\n      "], _a.raw = ["\n        mutation setName {\n          name\n        }\n      "], graphql_tag_1.default(_a));
            var mutationData = {
                name: 'Leia Skywalker',
            };
            var optimisticResponse = {
                name: 'Leia Skywalker (optimistic)',
            };
            var updateQueries = {
                query: function (previousQueryResult, _a) {
                    var mutationResult = _a.mutationResult;
                    return {
                        people_one: { name: mutationResult.data.name },
                    };
                },
            };
            it('returns optimistic mutation results from the store', function (done) {
                var queryManager = mockQueryManager_1.default({
                    request: { query: query, variables: variables },
                    result: { data: dataOne },
                }, {
                    request: { query: mutation },
                    result: { data: mutationData },
                });
                var observable = queryManager.watchQuery({
                    query: query,
                    variables: variables,
                });
                subscribeAndCount_1.default(done, observable, function (count, result) {
                    assert.deepEqual(result, observable.currentResult());
                    if (count === 1) {
                        assert.deepEqual(result, {
                            data: dataOne,
                            loading: false,
                            networkStatus: 7,
                        });
                        queryManager.mutate({ mutation: mutation, optimisticResponse: optimisticResponse, updateQueries: updateQueries });
                    }
                    else if (count === 2) {
                        assert.deepEqual(result.data.people_one, optimisticResponse);
                    }
                    else if (count === 3) {
                        assert.deepEqual(result.data.people_one, mutationData);
                        done();
                    }
                });
            });
            var _a;
        });
    });
    var _a, _b;
});
//# sourceMappingURL=ObservableQuery.js.map