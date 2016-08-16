"use strict";
var QueryManager_1 = require('../src/QueryManager');
var store_1 = require('../src/store');
var extensions_1 = require('../src/data/extensions');
var queryTransform_1 = require('../src/queries/queryTransform');
var graphql_tag_1 = require('graphql-tag');
var chai_1 = require('chai');
var async_1 = require('async');
var index_1 = require('../src/index');
var redux_1 = require('redux');
var Rx = require('rxjs');
var assign = require('lodash.assign');
var mockNetworkInterface_1 = require('./mocks/mockNetworkInterface');
var getFromAST_1 = require('../src/queries/getFromAST');
describe('QueryManager', function () {
    var dataIdFromObject = function (object) {
        if (object.__typename && object.id) {
            return object.__typename + '__' + object.id;
        }
    };
    var createQueryManager = function (_a) {
        var networkInterface = _a.networkInterface, store = _a.store, reduxRootKey = _a.reduxRootKey, queryTransformer = _a.queryTransformer, shouldBatch = _a.shouldBatch;
        return new QueryManager_1.QueryManager({
            networkInterface: networkInterface || mockNetworkInterface_1.default(),
            store: store || store_1.createApolloStore(),
            reduxRootKey: reduxRootKey || 'apollo',
            queryTransformer: queryTransformer,
            shouldBatch: shouldBatch,
        });
    };
    var mockQueryManager = function () {
        var mockedResponses = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            mockedResponses[_i - 0] = arguments[_i];
        }
        return new QueryManager_1.QueryManager({
            networkInterface: mockNetworkInterface_1.default.apply(void 0, mockedResponses),
            store: store_1.createApolloStore(),
            reduxRootKey: 'apollo',
        });
    };
    var mockWatchQuery = function (mockedResponse) {
        var queryManager = mockQueryManager(mockedResponse);
        return queryManager.watchQuery({ query: mockedResponse.request.query });
    };
    var assertWithObserver = function (_a) {
        var query = _a.query, _b = _a.variables, variables = _b === void 0 ? {} : _b, _c = _a.queryOptions, queryOptions = _c === void 0 ? {} : _c, result = _a.result, error = _a.error, delay = _a.delay, observer = _a.observer;
        var queryManager = mockQueryManager({
            request: { query: query, variables: variables },
            result: result,
            error: error,
            delay: delay,
        });
        var finalOptions = assign({ query: query, variables: variables }, queryOptions);
        return queryManager.watchQuery(finalOptions).subscribe(observer);
    };
    var assertRoundtrip = function (_a) {
        var query = _a.query, data = _a.data, _b = _a.variables, variables = _b === void 0 ? {} : _b, done = _a.done;
        assertWithObserver({
            query: query,
            result: { data: data },
            variables: variables,
            observer: {
                next: function (result) {
                    chai_1.assert.deepEqual(result.data, data, 'Roundtrip assertion failed.');
                    done();
                },
            },
        });
    };
    var mockMutation = function (_a) {
        var mutation = _a.mutation, data = _a.data, _b = _a.variables, variables = _b === void 0 ? {} : _b, store = _a.store;
        if (!store) {
            store = store_1.createApolloStore();
        }
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: mutation, variables: variables },
            result: { data: data },
        });
        var queryManager = createQueryManager({ networkInterface: networkInterface, store: store });
        return new Promise(function (resolve, reject) {
            queryManager.mutate({ mutation: mutation, variables: variables }).then(function (result) {
                resolve({ result: result, queryManager: queryManager });
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    var assertMutationRoundtrip = function (opts) {
        mockMutation(opts).then(function (_a) {
            var result = _a.result;
            chai_1.assert.deepEqual(result.data, opts.data);
            opts.done();
        }).catch(function (error) {
            opts.done(error);
        });
    };
    var mockRefetch = function (_a) {
        var request = _a.request, firstResult = _a.firstResult, secondResult = _a.secondResult;
        return mockQueryManager({
            request: request,
            result: firstResult,
        }, {
            request: request,
            result: secondResult,
        });
    };
    it('properly roundtrips through a Redux store', function (done) {
        assertRoundtrip({
            query: (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], graphql_tag_1.default(_a)),
            data: {
                allPeople: {
                    people: [
                        {
                            name: 'Luke Skywalker',
                        },
                    ],
                },
            },
            done: done,
        });
        var _a;
    });
    it('runs multiple root queries', function (done) {
        assertRoundtrip({
            query: (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n        person(id: \"1\") {\n          name\n        }\n      }\n    "], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n        person(id: \"1\") {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a)),
            data: {
                allPeople: {
                    people: [
                        {
                            name: 'Luke Skywalker',
                        },
                    ],
                },
                person: {
                    name: 'Luke Skywalker',
                },
            },
            done: done,
        });
        var _a;
    });
    it('properly roundtrips through a Redux store with variables', function (done) {
        assertRoundtrip({
            query: (_a = ["\n      query people($firstArg: Int) {\n        allPeople(first: $firstArg) {\n          people {\n            name\n          }\n        }\n      }"], _a.raw = ["\n      query people($firstArg: Int) {\n        allPeople(first: $firstArg) {\n          people {\n            name\n          }\n        }\n      }"], graphql_tag_1.default(_a)),
            variables: {
                firstArg: 1,
            },
            data: {
                allPeople: {
                    people: [
                        {
                            name: 'Luke Skywalker',
                        },
                    ],
                },
            },
            done: done,
        });
        var _a;
    });
    it('handles GraphQL errors', function (done) {
        assertWithObserver({
            query: (_a = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n                name\n              }\n            }\n          }"], _a.raw = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n                name\n              }\n            }\n          }"], graphql_tag_1.default(_a)),
            variables: {},
            result: {
                errors: [
                    {
                        name: 'Name',
                        message: 'This is an error message.',
                    },
                ],
            },
            observer: {
                next: function (result) {
                    done(new Error('Returned a result when it was supposed to error out'));
                },
                error: function (apolloError) {
                    chai_1.assert(apolloError);
                    done();
                },
            },
        });
        var _a;
    });
    it('handles GraphQL errors with data returned', function (done) {
        assertWithObserver({
            query: (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], graphql_tag_1.default(_a)),
            result: {
                data: {
                    allPeople: {
                        people: {
                            name: 'Ada Lovelace',
                        },
                    },
                },
                errors: [
                    {
                        name: 'Name',
                        message: 'This is an error message.',
                    },
                ],
            },
            observer: {
                next: function (result) {
                    done(new Error('Returned data when it was supposed to error out.'));
                },
                error: function (apolloError) {
                    chai_1.assert(apolloError);
                    done();
                },
            },
        });
        var _a;
    });
    it('empty error array (handle non-spec-compliant server) #156', function (done) {
        assertWithObserver({
            query: (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], graphql_tag_1.default(_a)),
            result: {
                data: {
                    allPeople: {
                        people: {
                            name: 'Ada Lovelace',
                        },
                    },
                },
                errors: [],
            },
            observer: {
                next: function (result) {
                    chai_1.assert.equal(result.data['allPeople'].people.name, 'Ada Lovelace');
                    chai_1.assert.notProperty(result, 'errors');
                    done();
                },
            },
        });
        var _a;
    });
    it('handles network errors', function (done) {
        assertWithObserver({
            query: (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], graphql_tag_1.default(_a)),
            error: new Error('Network error'),
            observer: {
                next: function (result) {
                    done(new Error('Should not deliver result'));
                },
                error: function (error) {
                    var apolloError = error;
                    chai_1.assert(apolloError.networkError);
                    chai_1.assert.include(apolloError.networkError.message, 'Network error');
                    done();
                },
            },
        });
        var _a;
    });
    it('uses console.error to log unhandled errors', function (done) {
        var oldError = console.error;
        var printed;
        console.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            printed = args;
        };
        assertWithObserver({
            query: (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], graphql_tag_1.default(_a)),
            error: new Error('Network error'),
            observer: {
                next: function (result) {
                    done(new Error('Should not deliver result'));
                },
            },
        });
        setTimeout(function () {
            chai_1.assert.match(printed[0], /error/);
            console.error = oldError;
            done();
        }, 10);
        var _a;
    });
    it('handles an unsubscribe action that happens before data returns', function (done) {
        var subscription = assertWithObserver({
            query: (_a = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], _a.raw = ["\n      query people {\n        allPeople(first: 1) {\n          people {\n            name\n          }\n        }\n      }"], graphql_tag_1.default(_a)),
            delay: 1000,
            observer: {
                next: function (result) {
                    done(new Error('Should not deliver result'));
                },
                error: function (error) {
                    done(new Error('Should not deliver result'));
                },
            },
        });
        chai_1.assert.doesNotThrow(subscription.unsubscribe);
        done();
        var _a;
    });
    it('supports interoperability with other Observable implementations like RxJS', function (done) {
        var expResult = {
            data: {
                allPeople: {
                    people: [
                        {
                            name: 'Luke Skywalker',
                        },
                    ],
                },
            },
        };
        var handle = mockWatchQuery({
            request: {
                query: (_a = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n              name\n            }\n          }\n        }"], _a.raw = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n              name\n            }\n          }\n        }"], graphql_tag_1.default(_a)),
            },
            result: expResult,
        });
        var observable = Rx.Observable.from(handle);
        observable
            .map(function (result) { return (assign({ fromRx: true }, result)); })
            .subscribe({
            next: function (newResult) {
                var expectedResult = assign({ fromRx: true, loading: false }, expResult);
                chai_1.assert.deepEqual(newResult, expectedResult);
                done();
            },
        });
        var _a;
    });
    it('allows you to refetch queries', function (done) {
        var request = {
            query: (_a = ["\n        query fetchLuke($id: String) {\n          people_one(id: $id) {\n            name\n          }\n        }"], _a.raw = ["\n        query fetchLuke($id: String) {\n          people_one(id: $id) {\n            name\n          }\n        }"], graphql_tag_1.default(_a)),
            variables: {
                id: '1',
            },
        };
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
            },
        };
        var queryManager = mockRefetch({
            request: request,
            firstResult: { data: data1 },
            secondResult: { data: data2 },
        });
        var handleCount = 0;
        var handle = queryManager.watchQuery(request);
        handle.subscribe({
            next: function (result) {
                handleCount++;
                if (handleCount === 1) {
                    chai_1.assert.deepEqual(result.data, data1);
                    handle.refetch();
                }
                else if (handleCount === 2) {
                    chai_1.assert.deepEqual(result.data, data2);
                    done();
                }
            },
        });
        var _a;
    });
    it('allows you to refetch queries with promises', function (done) {
        var request = {
            query: (_a = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }"], _a.raw = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }"], graphql_tag_1.default(_a)),
        };
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
            },
        };
        var queryManager = mockRefetch({
            request: request,
            firstResult: { data: data1 },
            secondResult: { data: data2 },
        });
        var handle = queryManager.watchQuery(request);
        handle.subscribe({});
        handle.refetch().then(function (result) {
            chai_1.assert.deepEqual(result.data, data2);
            done();
        });
        var _a;
    });
    it('allows you to refetch queries with new variables', function (done) {
        var query = (_a = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
            },
        };
        var data3 = {
            people_one: {
                name: 'Luke Skywalker has a new name and age',
            },
        };
        var variables = {
            test: 'I am your father',
        };
        var queryManager = mockQueryManager({
            request: { query: query },
            result: { data: data1 },
        }, {
            request: { query: query },
            result: { data: data2 },
        }, {
            request: { query: query, variables: variables },
            result: { data: data3 },
        });
        var handleCount = 0;
        var handle = queryManager.watchQuery({ query: query });
        handle.subscribe({
            next: function (result) {
                handleCount++;
                if (handleCount === 1) {
                    chai_1.assert.deepEqual(result.data, data1);
                    handle.refetch();
                }
                else if (handleCount === 2) {
                    chai_1.assert.deepEqual(result.data, data2);
                    handle.refetch(variables);
                }
                else if (handleCount === 3) {
                    chai_1.assert.deepEqual(result.data, data3);
                    done();
                }
            },
        });
        var _a;
    });
    it('continues to poll after refetch', function (done) {
        var query = (_a = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
            },
        };
        var data3 = {
            people_one: {
                name: 'Patsy',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query },
            result: { data: data1 },
        }, {
            request: { query: query },
            result: { data: data2 },
        }, {
            request: { query: query },
            result: { data: data3 },
        });
        var handle = queryManager.watchQuery({
            query: query,
            pollInterval: 200,
        });
        var resultCount = 0;
        handle.subscribe({
            next: function (result) {
                resultCount++;
                if (resultCount === 1) {
                    handle.refetch();
                }
                ;
                if (resultCount === 3) {
                    handle.stopPolling();
                    chai_1.assert(result);
                    done();
                }
            },
        });
        var _a;
    });
    it('doesn\'t explode if you refetch before first fetch is done with query diffing', function (done) {
        var primeQuery = (_a = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var complexQuery = (_b = ["\n      {\n        luke: people_one(id: 1) {\n          name\n        }\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], _b.raw = ["\n      {\n        luke: people_one(id: 1) {\n          name\n        }\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var diffedQuery = (_c = ["\n      {\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], _c.raw = ["\n      {\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_c));
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            vader: {
                name: 'Darth Vader',
            },
        };
        var dataRefetch = {
            luke: {
                name: 'Luke has a new name',
            },
            vader: {
                name: 'Vader has a new name',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: primeQuery },
            result: { data: data1 },
        }, {
            request: { query: diffedQuery },
            result: { data: data2 },
            delay: 5,
        }, {
            request: { query: complexQuery },
            result: { data: dataRefetch },
            delay: 10,
        });
        queryManager.query({ query: primeQuery }).then(function () {
            var handleCount = 0;
            var handle = queryManager.watchQuery({
                query: complexQuery,
            });
            var subscription = handle.subscribe({
                next: function (result) {
                    handleCount++;
                    if (handleCount === 1) {
                        chai_1.assert.deepEqual(result.data, dataRefetch);
                        subscription.unsubscribe();
                        done();
                    }
                },
                error: function (error) {
                    done(error);
                },
            });
            handle.refetch();
        });
        var _a, _b, _c;
    });
    it('supports returnPartialData #193', function () {
        var primeQuery = (_a = ["\n      query primeQuery {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      query primeQuery {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var complexQuery = (_b = ["\n      query complexQuery {\n        luke: people_one(id: 1) {\n          name\n        }\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], _b.raw = ["\n      query complexQuery {\n        luke: people_one(id: 1) {\n          name\n        }\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var diffedQuery = (_c = ["\n      query complexQuery {\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], _c.raw = ["\n      query complexQuery {\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_c));
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            vader: {
                name: 'Darth Vader',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: primeQuery },
            result: { data: data1 },
        }, {
            request: { query: diffedQuery },
            result: { data: data2 },
            delay: 5,
        });
        queryManager.query({
            query: primeQuery,
        }).then(function () {
            var handle = queryManager.watchQuery({
                query: complexQuery,
                returnPartialData: true,
            });
            return handle.result().then(function (result) {
                chai_1.assert.equal(result.data['luke'].name, 'Luke Skywalker');
                chai_1.assert.notProperty(result.data, 'vader');
            });
        });
        var _a, _b, _c;
    });
    it('should error if we pass noFetch on a polling query', function (done) {
        chai_1.assert.throw(function () {
            assertWithObserver({
                observer: {
                    next: function (result) {
                        done(new Error('Returned a result when it should not have.'));
                    },
                },
                query: (_a = ["\n          query {\n            author {\n              firstName\n              lastName\n            }\n          }"], _a.raw = ["\n          query {\n            author {\n              firstName\n              lastName\n            }\n          }"], graphql_tag_1.default(_a)),
                queryOptions: { pollInterval: 200, noFetch: true },
            });
            var _a;
        });
        done();
    });
    it('supports noFetch fetching only cached data', function () {
        var primeQuery = (_a = ["\n      query primeQuery {\n        luke: people_one(id: 1) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      query primeQuery {\n        luke: people_one(id: 1) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var complexQuery = (_b = ["\n      query complexQuery {\n        luke: people_one(id: 1) {\n          name\n        }\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], _b.raw = ["\n      query complexQuery {\n        luke: people_one(id: 1) {\n          name\n        }\n        vader: people_one(id: 4) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var data1 = {
            luke: {
                name: 'Luke Skywalker',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: primeQuery },
            result: { data: data1 },
        });
        queryManager.query({
            query: primeQuery,
        }).then(function () {
            var handle = queryManager.watchQuery({
                query: complexQuery,
                noFetch: true,
            });
            return handle.result().then(function (result) {
                chai_1.assert.equal(result.data['luke'].name, 'Luke Skywalker');
                chai_1.assert.notProperty(result.data, 'vader');
            });
        });
        var _a, _b;
    });
    it('runs a mutation', function (done) {
        assertMutationRoundtrip({
            mutation: (_a = ["\n        mutation makeListPrivate {\n          makeListPrivate(id: \"5\")\n        }"], _a.raw = ["\n        mutation makeListPrivate {\n          makeListPrivate(id: \"5\")\n        }"], graphql_tag_1.default(_a)),
            data: { makeListPrivate: true },
            done: done,
        });
        var _a;
    });
    it('runs a mutation with variables', function (done) {
        assertMutationRoundtrip({
            mutation: (_a = ["\n        mutation makeListPrivate($listId: ID!) {\n          makeListPrivate(id: $listId)\n        }"], _a.raw = ["\n        mutation makeListPrivate($listId: ID!) {\n          makeListPrivate(id: $listId)\n        }"], graphql_tag_1.default(_a)),
            variables: { listId: '1' },
            data: { makeListPrivate: true },
            done: done,
        });
        var _a;
    });
    it('runs a mutation with object parameters and puts the result in the store', function (done) {
        var data = {
            makeListPrivate: {
                id: '5',
                isPrivate: true,
            },
        };
        mockMutation({
            mutation: (_a = ["\n        mutation makeListPrivate {\n          makeListPrivate(input: {id: \"5\"}) {\n            id,\n            isPrivate,\n          }\n        }"], _a.raw = ["\n        mutation makeListPrivate {\n          makeListPrivate(input: {id: \"5\"}) {\n            id,\n            isPrivate,\n          }\n        }"], graphql_tag_1.default(_a)),
            data: data,
            store: store_1.createApolloStore({
                config: { dataIdFromObject: extensions_1.getIdField },
            }),
        }).then(function (_a) {
            var result = _a.result, queryManager = _a.queryManager;
            chai_1.assert.deepEqual(result.data, data);
            chai_1.assert.deepEqual(queryManager.store.getState()['apollo'].data['5'], { id: '5', isPrivate: true });
            done();
        });
        var _a;
    });
    it('runs a mutation and puts the result in the store', function () {
        var data = {
            makeListPrivate: {
                id: '5',
                isPrivate: true,
            },
        };
        return mockMutation({
            mutation: (_a = ["\n        mutation makeListPrivate {\n          makeListPrivate(id: \"5\") {\n            id,\n            isPrivate,\n          }\n        }"], _a.raw = ["\n        mutation makeListPrivate {\n          makeListPrivate(id: \"5\") {\n            id,\n            isPrivate,\n          }\n        }"], graphql_tag_1.default(_a)),
            data: data,
            store: store_1.createApolloStore({
                config: { dataIdFromObject: extensions_1.getIdField },
            }),
        }).then(function (_a) {
            var result = _a.result, queryManager = _a.queryManager;
            chai_1.assert.deepEqual(result.data, data);
            chai_1.assert.deepEqual(queryManager.store.getState()['apollo'].data['5'], { id: '5', isPrivate: true });
        });
        var _a;
    });
    it('runs a mutation and puts the result in the store with root key', function () {
        var mutation = (_a = ["\n      mutation makeListPrivate {\n        makeListPrivate(id: \"5\") {\n          id,\n          isPrivate,\n        }\n      }\n    "], _a.raw = ["\n      mutation makeListPrivate {\n        makeListPrivate(id: \"5\") {\n          id,\n          isPrivate,\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            makeListPrivate: {
                id: '5',
                isPrivate: true,
            },
        };
        var reduxRootKey = 'test';
        var store = store_1.createApolloStore({
            reduxRootKey: reduxRootKey,
            config: { dataIdFromObject: extensions_1.getIdField },
        });
        var queryManager = createQueryManager({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: mutation },
                result: { data: data },
            }),
            store: store,
            reduxRootKey: reduxRootKey,
        });
        return queryManager.mutate({
            mutation: mutation,
        }).then(function (result) {
            chai_1.assert.deepEqual(result.data, data);
            chai_1.assert.deepEqual(store.getState()[reduxRootKey].data['5'], { id: '5', isPrivate: true });
        });
        var _a;
    });
    it('diffs queries, preserving variable declarations', function (done) {
        testDiffing([
            {
                query: (_a = ["\n          {\n            people_one(id: \"1\") {\n              __typename,\n              id,\n              name\n            }\n          }\n        "], _a.raw = ["\n          {\n            people_one(id: \"1\") {\n              __typename,\n              id,\n              name\n            }\n          }\n        "], graphql_tag_1.default(_a)),
                diffedQuery: (_b = ["\n          {\n            people_one(id: \"1\") {\n              __typename,\n              id,\n              name\n            }\n          }\n        "], _b.raw = ["\n          {\n            people_one(id: \"1\") {\n              __typename,\n              id,\n              name\n            }\n          }\n        "], graphql_tag_1.default(_b)),
                diffedQueryResponse: {
                    people_one: {
                        __typename: 'Person',
                        id: '1',
                        name: 'Luke Skywalker',
                    },
                },
                fullResponse: {
                    people_one: {
                        __typename: 'Person',
                        id: '1',
                        name: 'Luke Skywalker',
                    },
                },
                variables: {},
            },
            {
                query: (_c = ["\n          query getSeveralPeople($lukeId: String!, $vaderId: String!) {\n            luke: people_one(id: $lukeId) {\n              __typename\n              id\n              name\n            }\n            vader: people_one(id: $vaderId) {\n              __typename\n              id\n              name\n            }\n          }\n        "], _c.raw = ["\n          query getSeveralPeople($lukeId: String!, $vaderId: String!) {\n            luke: people_one(id: $lukeId) {\n              __typename\n              id\n              name\n            }\n            vader: people_one(id: $vaderId) {\n              __typename\n              id\n              name\n            }\n          }\n        "], graphql_tag_1.default(_c)),
                diffedQuery: (_d = ["\n          query getSeveralPeople($vaderId: String!) {\n            vader: people_one(id: $vaderId) {\n              __typename\n              id\n              name\n            }\n          }\n        "], _d.raw = ["\n          query getSeveralPeople($vaderId: String!) {\n            vader: people_one(id: $vaderId) {\n              __typename\n              id\n              name\n            }\n          }\n        "], graphql_tag_1.default(_d)),
                diffedQueryResponse: {
                    vader: {
                        __typename: 'Person',
                        id: '4',
                        name: 'Darth Vader',
                    },
                },
                fullResponse: {
                    luke: {
                        __typename: 'Person',
                        id: '1',
                        name: 'Luke Skywalker',
                    },
                    vader: {
                        __typename: 'Person',
                        id: '4',
                        name: 'Darth Vader',
                    },
                },
                variables: {
                    lukeId: '1',
                    vaderId: '4',
                },
            },
        ], {}, done);
        var _a, _b, _c, _d;
    });
    it('diffs queries with fragments, removing unused variables', function (done) {
        testDiffing([
            {
                query: (_a = ["\n          query one ($fullName: String!) {\n            people_one(id: \"1\") {\n              ...personInfo\n            }\n          }\n\n          fragment personInfo on Person {\n            __typename,\n            id,\n            name(fullName: $fullName)\n          }\n        "], _a.raw = ["\n          query one ($fullName: String!) {\n            people_one(id: \"1\") {\n              ...personInfo\n            }\n          }\n\n          fragment personInfo on Person {\n            __typename,\n            id,\n            name(fullName: $fullName)\n          }\n        "], graphql_tag_1.default(_a)),
                diffedQuery: (_b = ["\n          query one ($fullName: String!) {\n            people_one(id: \"1\") {\n              ...personInfo\n            }\n          }\n\n          fragment personInfo on Person {\n            __typename,\n            id,\n            name(fullName: $fullName)\n          }\n        "], _b.raw = ["\n          query one ($fullName: String!) {\n            people_one(id: \"1\") {\n              ...personInfo\n            }\n          }\n\n          fragment personInfo on Person {\n            __typename,\n            id,\n            name(fullName: $fullName)\n          }\n        "], graphql_tag_1.default(_b)),
                diffedQueryResponse: {
                    people_one: {
                        __typename: 'Person',
                        id: '1',
                        name: 'Luke Skywalker',
                    },
                },
                fullResponse: {
                    people_one: {
                        __typename: 'Person',
                        id: '1',
                        name: 'Luke Skywalker',
                    },
                },
                variables: {
                    fullName: 'Edmonds Karp',
                },
            },
            {
                query: (_c = ["\n          query getSeveralPeople($lukeId: String!, $vaderId: String!, $fullName: String!) {\n            luke: people_one(id: $lukeId) {\n              ...personInfo\n            }\n            vader: people_one(id: $vaderId) {\n              ...personInfo\n            }\n          }\n\n          fragment personInfo on Person {\n            __typename,\n            id,\n            name(fullName: $fullName)\n          }\n        "], _c.raw = ["\n          query getSeveralPeople($lukeId: String!, $vaderId: String!, $fullName: String!) {\n            luke: people_one(id: $lukeId) {\n              ...personInfo\n            }\n            vader: people_one(id: $vaderId) {\n              ...personInfo\n            }\n          }\n\n          fragment personInfo on Person {\n            __typename,\n            id,\n            name(fullName: $fullName)\n          }\n        "], graphql_tag_1.default(_c)),
                diffedQuery: (_d = ["\n          query getSeveralPeople($vaderId: String!, $fullName: String!) {\n            vader: people_one(id: $vaderId) {\n              ...personInfo\n            }\n          }\n\n          fragment personInfo on Person {\n            __typename,\n            id,\n            name(fullName: $fullName)\n          }\n        "], _d.raw = ["\n          query getSeveralPeople($vaderId: String!, $fullName: String!) {\n            vader: people_one(id: $vaderId) {\n              ...personInfo\n            }\n          }\n\n          fragment personInfo on Person {\n            __typename,\n            id,\n            name(fullName: $fullName)\n          }\n        "], graphql_tag_1.default(_d)),
                diffedQueryResponse: {
                    vader: {
                        __typename: 'Person',
                        id: '4',
                        name: 'Darth Vader',
                    },
                },
                fullResponse: {
                    luke: {
                        __typename: 'Person',
                        id: '1',
                        name: 'Luke Skywalker',
                    },
                    vader: {
                        __typename: 'Person',
                        id: '4',
                        name: 'Darth Vader',
                    },
                },
                variables: {
                    lukeId: '1',
                    vaderId: '4',
                    fullName: 'Edmonds Karp',
                },
            },
        ], {}, done);
        var _a, _b, _c, _d;
    });
    it('does not broadcast queries when non-apollo actions are dispatched', function (done) {
        var query = (_a = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            id: '1',
        };
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
            },
        };
        function testReducer(state, action) {
            if (state === void 0) { state = false; }
            if (action.type === 'TOGGLE') {
                return true;
            }
            return state;
        }
        var client = new index_1.default();
        var store = redux_1.createStore(redux_1.combineReducers({
            test: testReducer,
            apollo: client.reducer(),
        }), redux_1.applyMiddleware(client.middleware()));
        var handleCount = 0;
        var handle = createQueryManager({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: query, variables: variables },
                result: { data: data1 },
            }, {
                request: { query: query, variables: variables },
                result: { data: data2 },
            }),
            store: store,
        }).watchQuery({ query: query, variables: variables });
        handle.subscribe({
            next: function (result) {
                handleCount++;
                if (handleCount === 1) {
                    chai_1.assert.deepEqual(result.data, data1);
                    return handle.refetch();
                }
                else if (handleCount === 2) {
                    chai_1.assert.deepEqual(result.data, data2);
                    store.dispatch({
                        type: 'TOGGLE',
                    });
                }
                chai_1.assert.equal(handleCount, 2);
                done();
            },
        });
        var _a;
    });
    it("doesn't return data while query is loading", function (done) {
        var query1 = (_a = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: 1) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var query2 = (_b = ["\n      {\n        people_one(id: 5) {\n          name\n        }\n      }\n    "], _b.raw = ["\n      {\n        people_one(id: 5) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var data2 = {
            people_one: {
                name: 'Darth Vader',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query1 },
            result: { data: data1 },
            delay: 10,
        }, {
            request: { query: query2 },
            result: { data: data2 },
        });
        var handle1Count = 0;
        var handle2Count = 0;
        queryManager.watchQuery({ query: query1 }).subscribe({
            next: function (result) {
                handle1Count++;
                checkDone();
            },
        });
        queryManager.watchQuery({ query: query2 }).subscribe({
            next: function (result) {
                handle2Count++;
                checkDone();
            },
        });
        function checkDone() {
            if (handle1Count === 1 && handle2Count === 1) {
                done();
            }
            if (handle1Count > 1) {
                chai_1.assert.fail();
            }
        }
        var _a, _b;
    });
    it("updates result of previous query if the result of a new query overlaps", function (done) {
        var query1 = (_a = ["\n      {\n        people_one(id: 1) {\n          name\n          age\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: 1) {\n          name\n          age\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
                age: 50,
            },
        };
        var query2 = (_b = ["\n      {\n        people_one(id: 1) {\n          name\n          username\n        }\n      }\n    "], _b.raw = ["\n      {\n        people_one(id: 1) {\n          name\n          username\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
                username: 'luke',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query1 },
            result: { data: data1 },
        }, {
            request: { query: query2 },
            result: { data: data2 },
            delay: 10,
        });
        var handle1Count = 0;
        queryManager.watchQuery({ query: query1 }).subscribe({
            next: function (result) {
                handle1Count++;
                if (handle1Count === 1) {
                    chai_1.assert.deepEqual(result.data, data1);
                    queryManager.query({
                        query: query2,
                    });
                }
                else if (handle1Count === 2 &&
                    result.data['people_one'].name === 'Luke Skywalker has a new name') {
                    chai_1.assert.deepEqual(result.data, {
                        people_one: {
                            name: 'Luke Skywalker has a new name',
                            age: 50,
                        },
                    });
                    done();
                }
            },
        });
        var _a, _b;
    });
    it('allows you to poll queries', function (done) {
        var query = (_a = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            id: '1',
        };
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query, variables: variables },
            result: { data: data1 },
        }, {
            request: { query: query, variables: variables },
            result: { data: data2 },
        });
        var handleCount = 0;
        var subscription = queryManager.watchQuery({
            query: query,
            variables: variables,
            pollInterval: 50,
        }).subscribe({
            next: function (result) {
                handleCount++;
                if (handleCount === 1) {
                    chai_1.assert.deepEqual(result.data, data1);
                }
                else if (handleCount === 2) {
                    chai_1.assert.deepEqual(result.data, data2);
                    subscription.unsubscribe();
                    done();
                }
            },
        });
        var _a;
    });
    it('should let you handle multiple polled queries and unsubscribe from one of them', function (done) {
        var query1 = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query {\n        person {\n          name\n        }\n      }"], _b.raw = ["\n      query {\n        person {\n          name\n        }\n      }"], graphql_tag_1.default(_b));
        var data11 = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var data12 = {
            author: {
                firstName: 'Jack',
                lastName: 'Smith',
            },
        };
        var data13 = {
            author: {
                firstName: 'Jolly',
                lastName: 'Smith',
            },
        };
        var data14 = {
            author: {
                firstName: 'Jared',
                lastName: 'Smith',
            },
        };
        var data21 = {
            person: {
                name: 'Jane Smith',
            },
        };
        var data22 = {
            person: {
                name: 'Josey Smith',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query1 },
            result: { data: data11 },
        }, {
            request: { query: query1 },
            result: { data: data12 },
        }, {
            request: { query: query1 },
            result: { data: data13 },
        }, {
            request: { query: query1 },
            result: { data: data14 },
        }, {
            request: { query: query2 },
            result: { data: data21 },
        }, {
            request: { query: query2 },
            result: { data: data22 },
        });
        var handle1Count = 0;
        var handleCount = 0;
        var setMilestone = false;
        var subscription1 = queryManager.watchQuery({
            query: query1,
            pollInterval: 150,
        }).subscribe({
            next: function (result) {
                handle1Count++;
                handleCount++;
                if (handle1Count > 1 && !setMilestone) {
                    subscription1.unsubscribe();
                    setMilestone = true;
                }
            },
        });
        var subscription2 = queryManager.watchQuery({
            query: query2,
            pollInterval: 2000,
        }).subscribe({
            next: function (result) {
                handleCount++;
            },
        });
        setTimeout(function () {
            chai_1.assert.equal(handleCount, 3);
            subscription1.unsubscribe();
            subscription2.unsubscribe();
            done();
        }, 400);
        var _a, _b;
    });
    it('allows you to unsubscribe from polled queries', function (done) {
        var query = (_a = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            id: '1',
        };
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query, variables: variables },
            result: { data: data1 },
        }, {
            request: { query: query, variables: variables },
            result: { data: data2 },
        });
        var handleCount = 0;
        var subscription = queryManager.watchQuery({
            query: query,
            variables: variables,
            pollInterval: 50,
        }).subscribe({
            next: function (result) {
                handleCount++;
                if (handleCount === 1) {
                    chai_1.assert.deepEqual(result.data, data1);
                }
                else if (handleCount === 2) {
                    chai_1.assert.deepEqual(result.data, data2);
                    subscription.unsubscribe();
                }
            },
        });
        setTimeout(function () {
            chai_1.assert.equal(handleCount, 2);
            done();
        }, 160);
        var _a;
    });
    it('allows you to unsubscribe from polled query errors', function (done) {
        var query = (_a = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            id: '1',
        };
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query, variables: variables },
            result: { data: data1 },
        }, {
            request: { query: query, variables: variables },
            error: new Error('Network error'),
        }, {
            request: { query: query, variables: variables },
            result: { data: data2 },
        });
        var handleCount = 0;
        var subscription = queryManager.watchQuery({
            query: query,
            variables: variables,
            pollInterval: 50,
        }).subscribe({
            next: function (result) {
                handleCount++;
                if (handleCount === 1) {
                    chai_1.assert.deepEqual(result.data, data1);
                }
                else if (handleCount === 2) {
                    done(new Error('Should not deliver second result'));
                }
            },
            error: function (error) {
                chai_1.assert.include(error.message, 'Network error');
                subscription.unsubscribe();
            },
        });
        setTimeout(function () {
            chai_1.assert.equal(handleCount, 1);
            done();
        }, 160);
        var _a;
    });
    it('exposes a way to start a polling query', function (done) {
        var query = (_a = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      query fetchLuke($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            id: '1',
        };
        var data1 = {
            people_one: {
                name: 'Luke Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Luke Skywalker has a new name',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query, variables: variables },
            result: { data: data1 },
        }, {
            request: { query: query, variables: variables },
            result: { data: data2 },
        });
        var handleCount = 0;
        var handle = queryManager.watchQuery({ query: query, variables: variables });
        var subscription = handle.subscribe({
            next: function (result) {
                handleCount++;
                if (handleCount === 1) {
                    chai_1.assert.deepEqual(result.data, data1);
                }
                else if (handleCount === 2) {
                    chai_1.assert.deepEqual(result.data, data2);
                    subscription.unsubscribe();
                    done();
                }
            },
        });
        handle.startPolling(50);
        var _a;
    });
    it('exposes a way to stop a polling query', function (done) {
        var query = (_a = ["\n      query fetchLeia($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], _a.raw = ["\n      query fetchLeia($id: String) {\n        people_one(id: $id) {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            id: '2',
        };
        var data1 = {
            people_one: {
                name: 'Leia Skywalker',
            },
        };
        var data2 = {
            people_one: {
                name: 'Leia Skywalker has a new name',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query, variables: variables },
            result: { data: data1 },
        }, {
            request: { query: query, variables: variables },
            result: { data: data2 },
        });
        var handleCount = 0;
        var handle = queryManager.watchQuery({
            query: query,
            variables: variables,
            pollInterval: 50,
        });
        handle.subscribe({
            next: function (result) {
                handleCount++;
                if (handleCount === 2) {
                    handle.stopPolling();
                }
            },
        });
        setTimeout(function () {
            chai_1.assert.equal(handleCount, 2);
            done();
        }, 160);
        var _a;
    });
    it('warns if you forget the template literal tag', function () {
        var queryManager = mockQueryManager();
        chai_1.assert.throws(function () {
            queryManager.query({
                query: 'string',
            });
        }, /wrap the query string in a "gql" tag/);
        chai_1.assert.throws(function () {
            queryManager.mutate({
                mutation: 'string',
            });
        }, /wrap the query string in a "gql" tag/);
        chai_1.assert.throws(function () {
            queryManager.watchQuery({
                query: 'string',
            });
        }, /wrap the query string in a "gql" tag/);
    });
    it('should transform queries correctly when given a QueryTransformer', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var transformedQuery = (_b = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n        }\n      }"], graphql_tag_1.default(_b));
        var unmodifiedQueryResult = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
            },
        };
        var transformedQueryResult = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
                '__typename': 'Author',
            },
        };
        createQueryManager({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: query },
                result: { data: unmodifiedQueryResult },
            }, {
                request: { query: transformedQuery },
                result: { data: transformedQueryResult },
            }),
            queryTransformer: queryTransform_1.addTypenameToSelectionSet,
        }).query({ query: query }).then(function (result) {
            chai_1.assert.deepEqual(result.data, transformedQueryResult);
            done();
        });
        var _a, _b;
    });
    it('should transform mutations correctly', function (done) {
        var mutation = (_a = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var transformedMutation = (_b = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          firstName\n          lastName\n          __typename\n        }\n      }"], _b.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          firstName\n          lastName\n          __typename\n        }\n      }"], graphql_tag_1.default(_b));
        var unmodifiedMutationResult = {
            'createAuthor': {
                'firstName': 'It works!',
                'lastName': 'It works!',
            },
        };
        var transformedMutationResult = {
            'createAuthor': {
                'firstName': 'It works!',
                'lastName': 'It works!',
                '__typename': 'Author',
            },
        };
        createQueryManager({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: mutation },
                result: { data: unmodifiedMutationResult },
            }, {
                request: { query: transformedMutation },
                result: { data: transformedMutationResult },
            }),
            queryTransformer: queryTransform_1.addTypenameToSelectionSet,
        }).mutate({ mutation: mutation }).then(function (result) {
            chai_1.assert.deepEqual(result.data, transformedMutationResult);
            done();
        });
        var _a, _b;
    });
    describe('batched queries', function () {
        it('should batch together two queries fired in the same batcher tick', function (done) {
            var query1 = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var query2 = (_b = ["\n        query {\n          person {\n            name\n          }\n        }"], _b.raw = ["\n        query {\n          person {\n            name\n          }\n        }"], graphql_tag_1.default(_b));
            var batchedNI = {
                query: function (request) {
                    return null;
                },
                batchQuery: function (requests) {
                    chai_1.assert.equal(requests.length, 2);
                    done();
                    return null;
                },
            };
            var queryManager = createQueryManager({
                networkInterface: batchedNI,
                shouldBatch: true,
            });
            queryManager.fetchQuery('fake-id', { query: query1 });
            queryManager.fetchQuery('even-more-fake-id', { query: query2 });
            var _a, _b;
        });
        it('should not batch together queries that are on different batcher ticks', function (done) {
            var query1 = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var query2 = (_b = ["\n        query {\n          person {\n            name\n          }\n        }"], _b.raw = ["\n        query {\n          person {\n            name\n          }\n        }"], graphql_tag_1.default(_b));
            var batchedNI = {
                query: function (request) {
                    return null;
                },
                batchQuery: function (requests) {
                    chai_1.assert.equal(requests.length, 1);
                    return new Promise(function (resolve, reject) {
                    });
                },
            };
            var queryManager = createQueryManager({
                networkInterface: batchedNI,
                shouldBatch: true,
            });
            queryManager.fetchQuery('super-fake-id', { query: query1 });
            setTimeout(function () {
                queryManager.fetchQuery('very-fake-id', { query: query2 });
                done();
            }, 100);
            var _a, _b;
        });
    });
    describe('store resets', function () {
        it('should change the store state to an empty state', function () {
            var queryManager = createQueryManager({});
            queryManager.resetStore();
            var currentState = queryManager.getApolloState();
            var expectedState = {
                data: {},
                mutations: {},
                queries: {},
                optimistic: [],
            };
            chai_1.assert.deepEqual(currentState, expectedState);
        });
        it('should only refetch once when we store reset', function (done) {
            var queryManager = null;
            var query = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var timesFired = 0;
            var numResults = 0;
            var networkInterface = {
                query: function (request) {
                    if (timesFired === 0) {
                        timesFired += 1;
                        queryManager.resetStore();
                    }
                    else {
                        timesFired += 1;
                    }
                    return Promise.resolve({ data: data });
                },
            };
            queryManager = createQueryManager({ networkInterface: networkInterface });
            queryManager.watchQuery({ query: query }).subscribe({
                next: function (result) {
                    numResults += 1;
                },
                error: function (err) {
                    done(new Error('Errored on observable on store reset.'));
                },
            });
            setTimeout(function () {
                chai_1.assert.equal(timesFired, 2);
                chai_1.assert.equal(numResults, 1);
                done();
            }, 100);
            var _a;
        });
        it('should throw an error on an inflight fetch query if the store is reset', function (done) {
            var query = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var queryManager = mockQueryManager({
                request: { query: query },
                result: { data: data },
                delay: 10000,
            });
            queryManager.fetchQuery('made up id', { query: query }).then(function (result) {
                done(new Error('Returned a result.'));
            }).catch(function (error) {
                chai_1.assert.include(error.message, 'Store reset');
                done();
            });
            queryManager.resetStore();
            var _a;
        });
        it('should call refetch on a mocked Observable if the store is reset', function (done) {
            var query = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var queryManager = mockQueryManager();
            var mockObservableQuery = {
                refetch: function (variables) {
                    done();
                    return null;
                },
                options: {
                    query: query,
                },
                scheduler: queryManager.scheduler,
            };
            var queryId = 'super-fake-id';
            queryManager.addObservableQuery(queryId, mockObservableQuery);
            queryManager.resetStore();
            var _a;
        });
        it('should not call refetch on a noFetch Observable if the store is reset', function (done) {
            var query = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var queryManager = createQueryManager({});
            var options = assign({});
            options.noFetch = true;
            options.query = query;
            var refetchCount = 0;
            var mockObservableQuery = {
                refetch: function (variables) {
                    refetchCount++;
                    done();
                    return null;
                },
                options: options,
                queryManager: queryManager,
            };
            var queryId = 'super-fake-id';
            queryManager.addObservableQuery(queryId, mockObservableQuery);
            queryManager.resetStore();
            setTimeout(function () {
                chai_1.assert.equal(refetchCount, 0);
                done();
            }, 400);
            var _a;
        });
        it('should throw an error on an inflight query() if the store is reset', function (done) {
            var queryManager = null;
            var query = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var networkInterface = {
                query: function (request) {
                    queryManager.resetStore();
                    return Promise.resolve({ data: data });
                },
            };
            queryManager = createQueryManager({ networkInterface: networkInterface });
            queryManager.query({ query: query }).then(function (result) {
                done(new Error('query() gave results on a store reset'));
            }).catch(function (error) {
                done();
            });
            var _a;
        });
    });
    describe('fragment referencing', function () {
        it('should accept a list of fragments and let us reference them through fetchQuery', function (done) {
            var fragment1 = getFromAST_1.getFragmentDefinition((_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_a)));
            var fragment2 = getFromAST_1.getFragmentDefinition((_b = ["\n        fragment personDetails on Person {\n          name\n        }"], _b.raw = ["\n        fragment personDetails on Person {\n          name\n        }"], graphql_tag_1.default(_b)));
            var fragments = [fragment1, fragment2];
            var query = (_c = ["\n        query {\n          author {\n            ...authorDetails\n          }\n          person {\n            ...personDetails\n          }\n        }"], _c.raw = ["\n        query {\n          author {\n            ...authorDetails\n          }\n          person {\n            ...personDetails\n          }\n        }"], graphql_tag_1.default(_c));
            var composedQuery = (_d = ["\n        query {\n          author {\n            ...authorDetails\n          }\n          person {\n            ...personDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment personDetails on Person {\n          name\n        }"], _d.raw = ["\n        query {\n          author {\n            ...authorDetails\n          }\n          person {\n            ...personDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment personDetails on Person {\n          name\n        }"], graphql_tag_1.default(_d));
            var data = {
                'author': {
                    'firstName': 'John',
                    'lastName': 'Smith',
                },
                'person': {
                    'name': 'John Smith',
                },
            };
            mockQueryManager({
                request: { query: composedQuery },
                result: { data: data },
            }).fetchQuery('bad-id', { query: query, fragments: fragments }).then(function (result) {
                chai_1.assert.deepEqual(result.data, data);
                done();
            });
            var _a, _b, _c, _d;
        });
        it('should accept a list of fragments and let us reference them from mutate', function (done) {
            var fragment1 = getFromAST_1.getFragmentDefinition((_a = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], _a.raw = ["\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_a)));
            var fragment2 = getFromAST_1.getFragmentDefinition((_b = ["\n        fragment personDetails on Person {\n          name\n        }"], _b.raw = ["\n        fragment personDetails on Person {\n          name\n        }"], graphql_tag_1.default(_b)));
            var fragments = [fragment1, fragment2];
            var mutation = (_c = ["\n        mutation changeStuff {\n          changeStuff {\n            author {\n              ...authorDetails\n            }\n            person {\n              ...personDetails\n            }\n          }\n       }"], _c.raw = ["\n        mutation changeStuff {\n          changeStuff {\n            author {\n              ...authorDetails\n            }\n            person {\n              ...personDetails\n            }\n          }\n       }"], graphql_tag_1.default(_c));
            var composedMutation = (_d = ["\n        mutation changeStuff {\n          changeStuff {\n            author {\n              ...authorDetails\n            }\n            person {\n              ...personDetails\n            }\n          }\n       }\n       fragment authorDetails on Author {\n         firstName\n         lastName\n       }\n       fragment personDetails on Person {\n         name\n       }"], _d.raw = ["\n        mutation changeStuff {\n          changeStuff {\n            author {\n              ...authorDetails\n            }\n            person {\n              ...personDetails\n            }\n          }\n       }\n       fragment authorDetails on Author {\n         firstName\n         lastName\n       }\n       fragment personDetails on Person {\n         name\n       }"], graphql_tag_1.default(_d));
            var data = {
                changeStuff: {
                    author: {
                        firstName: 'John',
                        lastName: 'Smith',
                    },
                    person: {
                        name: 'John Smith',
                    },
                },
            };
            mockQueryManager({
                request: { query: composedMutation },
                result: { data: data },
            }).mutate({ mutation: mutation, fragments: fragments }).then(function (result) {
                chai_1.assert.deepEqual(result, { data: data });
                done();
            });
            var _a, _b, _c, _d;
        });
    });
    it('should reject a query promise given a network error', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var networkError = new Error('Network error');
        mockQueryManager({
            request: { query: query },
            error: networkError,
        }).query({ query: query }).then(function (result) {
            done(new Error('Returned result on an errored fetchQuery'));
        }).catch(function (error) {
            var apolloError = error;
            chai_1.assert(apolloError.message);
            chai_1.assert.equal(apolloError.networkError, networkError);
            chai_1.assert(!apolloError.graphQLErrors);
            done();
        });
        var _a;
    });
    it('should error when we attempt to give an id beginning with $', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n          id\n          __typename\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n          id\n          __typename\n        }\n      }"], graphql_tag_1.default(_a));
        var data = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
                id: '129',
                __typename: 'Author',
            },
        };
        var reducerConfig = { dataIdFromObject: function (x) { return '$' + dataIdFromObject(x); } };
        var store = store_1.createApolloStore({ config: reducerConfig, reportCrashes: false });
        createQueryManager({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: query },
                result: { data: data },
            }),
            store: store,
        }).query({ query: query }).then(function (result) {
            done(new Error('Returned a result when it should not have.'));
        }).catch(function (error) {
            done();
        });
        var _a;
    });
    it('should reject a query promise given a GraphQL error', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var graphQLErrors = [new Error('GraphQL error')];
        mockQueryManager({
            request: { query: query },
            result: { errors: graphQLErrors },
        }).query({ query: query }).then(function (result) {
            done(new Error('Returned result on an errored fetchQuery'));
        }).catch(function (error) {
            var apolloError = error;
            chai_1.assert(apolloError.message);
            chai_1.assert.equal(apolloError.graphQLErrors, graphQLErrors);
            chai_1.assert(!apolloError.networkError);
            done();
        });
        var _a;
    });
    it('should not empty the store when a non-polling query fails due to a network error', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var data = {
            author: {
                firstName: 'Dhaivat',
                lastName: 'Pandya',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query },
            result: { data: data },
        }, {
            request: { query: query },
            error: new Error('Network error ocurred'),
        });
        queryManager.query({ query: query }).then(function (result) {
            chai_1.assert.deepEqual(result.data, data);
            queryManager.query({ query: query, forceFetch: true }).then(function () {
                done(new Error('Returned a result when it was not supposed to.'));
            }).catch(function (error) {
                chai_1.assert.deepEqual(queryManager.store.getState().apollo.data['$ROOT_QUERY.author'], data['author']);
                done();
            });
        }).catch(function (error) {
            done(new Error('Threw an error on the first query.'));
        });
        var _a;
    });
    it('should be able to unsubscribe from a polling query subscription', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var data = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var timesFired = 0;
        var subscription = mockQueryManager({
            request: { query: query },
            result: { data: data },
        }).watchQuery({ query: query, pollInterval: 20 })
            .subscribe({
            next: function (result) {
                timesFired += 1;
                subscription.unsubscribe();
            },
        });
        setTimeout(function () {
            chai_1.assert.equal(timesFired, 1);
            done();
        }, 60);
        var _a;
    });
    it('should not empty the store when a polling query fails due to a network error', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var data = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query },
            result: { data: data },
        }, {
            request: { query: query },
            error: new Error('Network error occurred.'),
        });
        var subscription = queryManager.watchQuery({ query: query, pollInterval: 20 })
            .subscribe({
            next: function (result) {
                chai_1.assert.deepEqual(result, { data: data });
                chai_1.assert.deepEqual(queryManager.store.getState().apollo.data['$ROOT_QUERY.author'], data.author);
            },
            error: function (error) {
                chai_1.assert.deepEqual(queryManager.store.getState().apollo.data['$ROOT_QUERY.author'], data.author);
                subscription.unsubscribe();
            },
        });
        setTimeout(function () {
            done();
        }, 100);
        var _a;
    });
    it('should not fire next on an observer if there is no change in the result', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var data = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var queryManager = mockQueryManager({
            request: { query: query },
            result: { data: data },
        }, {
            request: { query: query },
            result: { data: data },
        });
        var timesFired = 0;
        queryManager.watchQuery({ query: query }).subscribe({
            next: function (result) {
                timesFired += 1;
                chai_1.assert.deepEqual(result.data, data);
            },
        });
        queryManager.query({ query: query }).then(function (result) {
            chai_1.assert.deepEqual(result.data, data);
            chai_1.assert.equal(timesFired, 1);
            done();
        });
        var _a;
    });
    it('should error when we orphan a real-id node in the store with a real-id node', function (done) {
        var query1 = (_a = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n          }\n          age\n          id\n          __typename\n        }\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n          }\n          age\n          id\n          __typename\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query {\n        author {\n          name {\n            firstName\n          }\n          id\n          __typename\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          name {\n            firstName\n          }\n          id\n          __typename\n        }\n      }"], graphql_tag_1.default(_b));
        var data1 = {
            author: {
                name: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
                age: 18,
                id: '187',
                __typename: 'Author',
            },
        };
        var data2 = {
            author: {
                name: {
                    firstName: 'John',
                },
                age: 18,
                id: '197',
                __typename: 'Author',
            },
        };
        var reducerConfig = { dataIdFromObject: dataIdFromObject };
        var store = store_1.createApolloStore({ config: reducerConfig, reportCrashes: false });
        var queryManager = createQueryManager({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: query1 },
                result: { data: data1 },
            }, {
                request: { query: query2 },
                result: { data: data2 },
            }),
            store: store,
        });
        var resultsReceived1 = 0;
        var resultsReceived2 = 0;
        var errorsReceived1 = 0;
        queryManager.watchQuery({ query: query1 }).subscribe({
            next: function (result) {
                resultsReceived1 += 1;
            },
            error: function (error) {
                chai_1.assert(error);
                errorsReceived1 += 1;
            },
        });
        queryManager.watchQuery({ query: query2 }).subscribe({
            next: function (result) {
                resultsReceived2 += 1;
            },
            error: function (error) {
                done(new Error('Erorred on the second handler.'));
            },
        });
        setTimeout(function () {
            chai_1.assert.equal(resultsReceived1, 1);
            chai_1.assert.equal(resultsReceived2, 1);
            chai_1.assert.equal(errorsReceived1, 1);
            done();
        }, 60);
        var _a, _b;
    });
    it('should error if we replace a real id node in the store with a generated id node', function (done) {
        var queryWithId = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n          id\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n          id\n        }\n      }"], graphql_tag_1.default(_a));
        var dataWithId = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
                id: '129',
                __typename: 'Author',
            },
        };
        var queryWithoutId = (_b = ["\n      query {\n        author {\n          address\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          address\n        }\n      }"], graphql_tag_1.default(_b));
        var dataWithoutId = {
            author: {
                address: 'fake address',
            },
        };
        var reducerConfig = { dataIdFromObject: dataIdFromObject };
        var store = store_1.createApolloStore({ config: reducerConfig, reportCrashes: false });
        var queryManager = createQueryManager({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: queryWithId },
                result: { data: dataWithId },
            }, {
                request: { query: queryWithoutId },
                result: { data: dataWithoutId },
            }),
            store: store,
        });
        var withIdResults = 0;
        var withIdErrors = 0;
        var withoutIdResults = 0;
        var withoutIdErrors = 0;
        queryManager.watchQuery({ query: queryWithId }).subscribe({
            next: function (result) {
                withIdResults += 1;
            },
            error: function (error) {
                withIdErrors += 1;
            },
        });
        queryManager.watchQuery({ query: queryWithoutId }).subscribe({
            next: function (result) {
                withoutIdResults += 1;
            },
            error: function (error) {
                chai_1.assert.include(error.message, 'Store error: ');
                withoutIdErrors += 1;
            },
        });
        setTimeout(function () {
            chai_1.assert.equal(withIdResults, 1);
            chai_1.assert.equal(withIdErrors, 0);
            chai_1.assert.equal(withoutIdResults, 0);
            chai_1.assert.equal(withoutIdErrors, 1);
            done();
        }, 60);
        var _a, _b;
    });
    it('should not error when merging a generated id store node  with a real id node', function (done) {
        var queryWithoutId = (_a = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n          }\n          age\n          __typename\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n          }\n          age\n          __typename\n        }\n      }"], graphql_tag_1.default(_a));
        var queryWithId = (_b = ["\n      query {\n        author {\n          name {\n            firstName\n          }\n          id\n          __typename\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          name {\n            firstName\n          }\n          id\n          __typename\n        }\n      }"], graphql_tag_1.default(_b));
        var dataWithoutId = {
            author: {
                name: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
                age: '124',
                __typename: 'Author',
            },
        };
        var dataWithId = {
            author: {
                name: {
                    firstName: 'Jane',
                },
                id: '129',
                __typename: 'Author',
            },
        };
        var store = store_1.createApolloStore({ config: { dataIdFromObject: dataIdFromObject } });
        var queryManager = createQueryManager({
            networkInterface: mockNetworkInterface_1.default({
                request: { query: queryWithoutId },
                result: { data: dataWithoutId },
            }, {
                request: { query: queryWithId },
                result: { data: dataWithId },
            }),
            store: store,
        });
        var withoutIdResultsReceived = 0;
        var withIdResultsReceived = 0;
        queryManager.watchQuery({ query: queryWithoutId }).subscribe({
            next: function (result) {
                withoutIdResultsReceived += 1;
                chai_1.assert.deepEqual(result, { data: dataWithoutId });
            },
        });
        queryManager.watchQuery({ query: queryWithId }).subscribe({
            next: function (result) {
                withIdResultsReceived += 1;
                chai_1.assert.deepEqual(result, { data: dataWithId });
            },
        });
        setTimeout(function () {
            chai_1.assert.equal(withoutIdResultsReceived, 2);
            chai_1.assert.equal(withIdResultsReceived, 1);
            done();
        }, 120);
        var _a, _b;
    });
    describe('loading state', function () {
        it('should be passed as false if we are not watching a query', function (done) {
            var query = (_a = ["\n        query {\n          fortuneCookie\n        }"], _a.raw = ["\n        query {\n          fortuneCookie\n        }"], graphql_tag_1.default(_a));
            var data = {
                fortuneCookie: 'Buy it',
            };
            mockQueryManager({
                request: { query: query },
                result: { data: data },
            }).query({ query: query }).then(function (result) {
                chai_1.assert(!result.loading);
                chai_1.assert.deepEqual(result.data, data);
                done();
            });
            var _a;
        });
        it('should be passed to the observer as true if we are returning partial data', function () {
            var primeQuery = (_a = ["\n        query {\n          fortuneCookie\n        }"], _a.raw = ["\n        query {\n          fortuneCookie\n        }"], graphql_tag_1.default(_a));
            var primeData = {
                fortuneCookie: 'You must stick to your goal but rethink your approach',
            };
            var query = (_b = ["\n        query {\n          fortuneCookie\n          author {\n            name\n          }\n        }"], _b.raw = ["\n        query {\n          fortuneCookie\n          author {\n            name\n          }\n        }"], graphql_tag_1.default(_b));
            var diffQuery = (_c = ["\n        query {\n          author {\n            name\n          }\n        }"], _c.raw = ["\n        query {\n          author {\n            name\n          }\n        }"], graphql_tag_1.default(_c));
            var diffData = {
                author: {
                    name: 'John',
                },
            };
            var queryManager = mockQueryManager({
                request: { query: diffQuery },
                result: { data: diffData },
                delay: 5,
            }, {
                request: { query: primeQuery },
                result: { data: primeData },
            });
            queryManager.query({ query: primeQuery }).then(function (primeResult) {
                queryManager.watchQuery({ query: query, returnPartialData: true }).subscribe({
                    next: function (result) {
                        chai_1.assert(result.loading);
                        chai_1.assert.deepEqual(result.data, { data: diffData });
                    },
                });
            });
            var _a, _b, _c;
        });
        it('should be passed to the observer as false if we are returning all the data', function (done) {
            assertWithObserver({
                query: (_a = ["\n          query {\n            author {\n              firstName\n              lastName\n            }\n          }"], _a.raw = ["\n          query {\n            author {\n              firstName\n              lastName\n            }\n          }"], graphql_tag_1.default(_a)),
                result: {
                    data: {
                        author: {
                            firstName: 'John',
                            lastName: 'Smith',
                        },
                    },
                },
                observer: {
                    next: function (result) {
                        chai_1.assert(!result.loading);
                        done();
                    },
                },
            });
            var _a;
        });
    });
    describe('refetchQueries', function () {
        it('should refetch the right query when a result is successfully returned', function (done) {
            var mutation = (_a = ["\n        mutation changeAuthorName {\n          changeAuthorName(newName: \"Jack Smith\") {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        mutation changeAuthorName {\n          changeAuthorName(newName: \"Jack Smith\") {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var mutationData = {
                changeAuthorName: {
                    firstName: 'Jack',
                    lastName: 'Smith',
                },
            };
            var query = (_b = ["\n        query getAuthors {\n          author {\n            firstName\n            lastName\n          }\n        }"], _b.raw = ["\n        query getAuthors {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_b));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var secondReqData = {
                author: {
                    firstName: 'Jane',
                    lastName: 'Johnson',
                },
            };
            var queryManager = mockQueryManager({
                request: { query: query },
                result: { data: data },
            }, {
                request: { query: query },
                result: { data: secondReqData },
            }, {
                request: { query: mutation },
                result: { data: mutationData },
            });
            var resultsReceived = 0;
            queryManager.watchQuery({ query: query }).subscribe({
                next: function (result) {
                    if (resultsReceived === 0) {
                        chai_1.assert.deepEqual(result.data, data);
                        queryManager.mutate({ mutation: mutation, refetchQueries: ['getAuthors'] });
                    }
                    else if (resultsReceived === 1) {
                        chai_1.assert.deepEqual(result.data, secondReqData);
                        done();
                    }
                    resultsReceived++;
                },
            });
            var _a, _b;
        });
    });
    describe('result transformation', function () {
        var client, response, transformCount;
        beforeEach(function () {
            transformCount = 0;
            var networkInterface = {
                query: function (request) {
                    return Promise.resolve(response);
                },
            };
            client = new index_1.default({
                networkInterface: networkInterface,
                resultTransformer: function (result) {
                    transformCount++;
                    return {
                        data: assign({}, result.data, { transformCount: transformCount }),
                        loading: false,
                    };
                },
            });
        });
        it('transforms query() results', function () {
            response = { data: { foo: 123 } };
            return client.query({ query: (_a = ["{ foo }"], _a.raw = ["{ foo }"], graphql_tag_1.default(_a)) })
                .then(function (result) {
                chai_1.assert.deepEqual(result.data, { foo: 123, transformCount: 1 });
            });
            var _a;
        });
        it('transforms watchQuery() results', function (done) {
            response = { data: { foo: 123 } };
            var handle = client.watchQuery({ query: (_a = ["{ foo }"], _a.raw = ["{ foo }"], graphql_tag_1.default(_a)) });
            var callCount = 0;
            handle.subscribe({
                error: done,
                next: function (result) {
                    try {
                        callCount++;
                        if (callCount === 1) {
                            chai_1.assert.deepEqual(result.data, { foo: 123, transformCount: 1 });
                            response = { data: { foo: 456 } };
                            handle.refetch();
                        }
                        else {
                            chai_1.assert.deepEqual(result.data, { foo: 456, transformCount: 2 });
                            done();
                        }
                    }
                    catch (error) {
                        done(error);
                    }
                },
            });
            var _a;
        });
        it('does not transform identical watchQuery() results', function (done) {
            response = { data: { foo: 123 } };
            var handle = client.watchQuery({ query: (_a = ["{ foo }"], _a.raw = ["{ foo }"], graphql_tag_1.default(_a)) });
            var callCount = 0;
            handle.subscribe({
                error: done,
                next: function (result) {
                    callCount++;
                    try {
                        chai_1.assert.equal(callCount, 1, 'observer should only fire once');
                        chai_1.assert.deepEqual(result.data, { foo: 123, transformCount: 1 });
                    }
                    catch (error) {
                        done(error);
                        return;
                    }
                    response = { data: { foo: 123 } };
                    handle.refetch().then(function () {
                        if (callCount === 1) {
                            done();
                        }
                    }).catch(done);
                },
            });
            var _a;
        });
        it('transforms mutate() results', function () {
            response = { data: { foo: 123 } };
            return client.mutate({ mutation: (_a = ["mutation makeChanges { foo }"], _a.raw = ["mutation makeChanges { foo }"], graphql_tag_1.default(_a)) })
                .then(function (result) {
                chai_1.assert.deepEqual(result.data, { foo: 123, transformCount: 1 });
            });
            var _a;
        });
    });
    describe('result transformation with custom equality', function () {
        var Model = (function () {
            function Model() {
            }
            return Model;
        }());
        var client, response;
        beforeEach(function () {
            var networkInterface = {
                query: function (request) {
                    return Promise.resolve(response);
                },
            };
            client = new index_1.default({
                networkInterface: networkInterface,
                resultTransformer: function (result) {
                    result.data.__proto__ = Model.prototype;
                    return result;
                },
                resultComparator: function (result1, result2) {
                    var foo1 = result1 && result1.data && result1.data.foo;
                    var foo2 = result2 && result2.data && result2.data.foo;
                    return foo1 === foo2;
                },
            });
        });
        it('does not transform identical watchQuery() results, according to the comparator', function (done) {
            response = { data: { foo: 123 } };
            var handle = client.watchQuery({ query: (_a = ["{ foo }"], _a.raw = ["{ foo }"], graphql_tag_1.default(_a)) });
            var callCount = 0;
            handle.subscribe({
                error: done,
                next: function (result) {
                    callCount++;
                    try {
                        chai_1.assert.equal(callCount, 1, 'observer should only fire once');
                        chai_1.assert.instanceOf(result.data, Model);
                    }
                    catch (error) {
                        done(error);
                        return;
                    }
                    response = { data: { foo: 123 } };
                    handle.refetch().then(function () {
                        if (callCount === 1) {
                            done();
                        }
                    }).catch(done);
                },
            });
            var _a;
        });
    });
});
function testDiffing(queryArray, config, done) {
    var mockedResponses = queryArray.map(function (_a) {
        var diffedQuery = _a.diffedQuery, diffedQueryResponse = _a.diffedQueryResponse, _b = _a.variables, variables = _b === void 0 ? {} : _b;
        return {
            request: { query: diffedQuery, variables: variables },
            result: { data: diffedQueryResponse },
        };
    });
    var networkInterface = mockNetworkInterface_1.default.apply(void 0, mockedResponses);
    var queryManager = new QueryManager_1.QueryManager({
        networkInterface: networkInterface,
        store: store_1.createApolloStore({
            config: { dataIdFromObject: extensions_1.getIdField },
        }),
        reduxRootKey: 'apollo',
    });
    var steps = queryArray.map(function (_a) {
        var query = _a.query, fullResponse = _a.fullResponse, variables = _a.variables;
        return function (cb) {
            queryManager.query({
                query: query,
                variables: variables,
            }).then(function (result) {
                chai_1.assert.deepEqual(result.data, fullResponse);
                cb();
            });
        };
    });
    async_1.series(steps, function (err, res) {
        done(err);
    });
}
//# sourceMappingURL=QueryManager.js.map