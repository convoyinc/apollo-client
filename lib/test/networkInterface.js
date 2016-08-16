"use strict";
var _this = this;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var lodash_1 = require('lodash');
chai.use(chaiAsPromised);
var assert = chai.assert, expect = chai.expect;
var networkInterface_1 = require('../src/networkInterface');
var graphql_tag_1 = require('graphql-tag');
var printer_1 = require('graphql-tag/printer');
describe('network interface', function () {
    before(function () {
        _this.realFetch = global['fetch'];
        global['fetch'] = (function (url, opts) {
            _this.lastFetchOpts = opts;
            if (url === 'http://does-not-exist.test/') {
                return Promise.reject('Network error');
            }
            if (url === 'http://graphql-swapi.test/') {
                url = 'http://graphql-swapi.parseapp.com/';
            }
            return _this.realFetch(url, opts);
        });
    });
    after(function () {
        global['fetch'] = _this.realFetch;
    });
    describe('creating a network interface', function () {
        it('should throw without an endpoint', function () {
            assert.throws(function () {
                networkInterface_1.createNetworkInterface(null);
            }, /A remote enpdoint is required for a network layer/);
        });
        it('should create an instance with a given uri', function () {
            var networkInterface = networkInterface_1.createNetworkInterface('/graphql');
            assert.equal(networkInterface._uri, '/graphql');
        });
        it('should allow for storing of custom options', function () {
            var customOpts = {
                headers: { 'Authorizaion': 'working' },
                credentials: 'include',
            };
            var networkInterface = networkInterface_1.createNetworkInterface('/graphql', customOpts);
            assert.deepEqual(networkInterface._opts, lodash_1.assign({}, customOpts));
        });
        it('should not mutate custom options', function () {
            var customOpts = {
                headers: ['Authorizaion', 'working'],
                credentials: 'include',
            };
            var originalOpts = lodash_1.assign({}, customOpts);
            var networkInterface = networkInterface_1.createNetworkInterface('/graphql', customOpts);
            delete customOpts.headers;
            assert.deepEqual(networkInterface._opts, originalOpts);
        });
    });
    describe('middleware', function () {
        it('should throw an error if you pass something bad', function () {
            var malWare = new TestWare();
            delete malWare.applyMiddleware;
            var networkInterface = networkInterface_1.createNetworkInterface('/graphql');
            try {
                networkInterface.use([malWare]);
                expect.fail();
            }
            catch (error) {
                assert.equal(error.message, 'Middleware must implement the applyMiddleware function');
            }
        });
        it('should take a middleware and assign it', function () {
            var testWare = new TestWare();
            var networkInterface = networkInterface_1.createNetworkInterface('/graphql');
            networkInterface.use([testWare]);
            assert.equal(networkInterface._middlewares[0], testWare);
        });
        it('should take more than one middleware and assign it', function () {
            var testWare1 = new TestWare();
            var testWare2 = new TestWare();
            var networkInterface = networkInterface_1.createNetworkInterface('/graphql');
            networkInterface.use([testWare1, testWare2]);
            assert.deepEqual(networkInterface._middlewares, [testWare1, testWare2]);
        });
        it('should alter the request', function () {
            var testWare1 = new TestWare([
                { key: 'personNum', val: 1 },
            ]);
            var swapi = networkInterface_1.createNetworkInterface('http://graphql-swapi.test/');
            swapi.use([testWare1]);
            var simpleRequest = {
                query: (_a = ["\n          query people($personNum: Int!) {\n            allPeople(first: $personNum) {\n              people {\n                name\n              }\n            }\n          }\n        "], _a.raw = ["\n          query people($personNum: Int!) {\n            allPeople(first: $personNum) {\n              people {\n                name\n              }\n            }\n          }\n        "], graphql_tag_1.default(_a)),
                variables: {},
                debugName: 'People query',
            };
            return assert.eventually.deepEqual(swapi.query(simpleRequest), {
                data: {
                    allPeople: {
                        people: [
                            {
                                name: 'Luke Skywalker',
                            },
                        ],
                    },
                },
            });
            var _a;
        });
        it('should alter the options but not overwrite defaults', function () {
            var testWare1 = new TestWare([], [
                { key: 'planet', val: 'mars' },
            ]);
            var swapi = networkInterface_1.createNetworkInterface('http://graphql-swapi.test/');
            swapi.use([testWare1]);
            var simpleRequest = {
                query: (_a = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n                name\n              }\n            }\n          }\n        "], _a.raw = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n                name\n              }\n            }\n          }\n        "], graphql_tag_1.default(_a)),
                variables: {},
                debugName: 'People query',
            };
            return swapi.query(simpleRequest).then(function (data) {
                assert.equal(_this.lastFetchOpts.planet, 'mars');
                assert.notOk(swapi._opts['planet']);
            });
            var _a;
        });
        it('handle multiple middlewares', function () {
            var testWare1 = new TestWare([
                { key: 'personNum', val: 1 },
            ]);
            var testWare2 = new TestWare([
                { key: 'filmNum', val: 1 },
            ]);
            var swapi = networkInterface_1.createNetworkInterface('http://graphql-swapi.test/');
            swapi.use([testWare1, testWare2]);
            var simpleRequest = {
                query: (_a = ["\n          query people($personNum: Int!, $filmNum: Int!) {\n            allPeople(first: $personNum) {\n              people {\n                name\n                filmConnection(first: $filmNum) {\n                  edges {\n                    node {\n                      id\n                    }\n                  }\n                }\n              }\n            }\n          }\n        "], _a.raw = ["\n          query people($personNum: Int!, $filmNum: Int!) {\n            allPeople(first: $personNum) {\n              people {\n                name\n                filmConnection(first: $filmNum) {\n                  edges {\n                    node {\n                      id\n                    }\n                  }\n                }\n              }\n            }\n          }\n        "], graphql_tag_1.default(_a)),
                variables: {},
                debugName: 'People query',
            };
            return assert.eventually.deepEqual(swapi.query(simpleRequest), {
                data: {
                    allPeople: {
                        people: [
                            {
                                name: 'Luke Skywalker',
                                filmConnection: {
                                    edges: [
                                        {
                                            node: {
                                                id: 'ZmlsbXM6MQ==',
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            });
            var _a;
        });
    });
    describe('afterware', function () {
        it('should throw an error if you pass something bad', function () {
            var malWare = new TestAfterWare();
            delete malWare.applyAfterware;
            var networkInterface = networkInterface_1.createNetworkInterface('/graphql');
            try {
                networkInterface.useAfter([malWare]);
                expect.fail();
            }
            catch (error) {
                assert.equal(error.message, 'Afterware must implement the applyAfterware function');
            }
        });
        it('should take a afterware and assign it', function () {
            var testWare = new TestAfterWare();
            var networkInterface = networkInterface_1.createNetworkInterface('/graphql');
            networkInterface.useAfter([testWare]);
            assert.equal(networkInterface._afterwares[0], testWare);
        });
        it('should take more than one afterware and assign it', function () {
            var testWare1 = new TestAfterWare();
            var testWare2 = new TestAfterWare();
            var networkInterface = networkInterface_1.createNetworkInterface('/graphql');
            networkInterface.useAfter([testWare1, testWare2]);
            assert.deepEqual(networkInterface._afterwares, [testWare1, testWare2]);
        });
    });
    describe('making a request', function () {
        it('should fetch remote data', function () {
            var swapi = networkInterface_1.createNetworkInterface('http://graphql-swapi.test/');
            var simpleRequest = {
                query: (_a = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n                name\n              }\n            }\n          }\n        "], _a.raw = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n                name\n              }\n            }\n          }\n        "], graphql_tag_1.default(_a)),
                variables: {},
                debugName: 'People query',
            };
            return assert.eventually.deepEqual(swapi.query(simpleRequest), {
                data: {
                    allPeople: {
                        people: [
                            {
                                name: 'Luke Skywalker',
                            },
                        ],
                    },
                },
            });
            var _a;
        });
        it('should throw on a network error', function () {
            var nowhere = networkInterface_1.createNetworkInterface('http://does-not-exist.test/');
            var doomedToFail = {
                query: (_a = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n                name\n              }\n            }\n          }\n        "], _a.raw = ["\n          query people {\n            allPeople(first: 1) {\n              people {\n                name\n              }\n            }\n          }\n        "], graphql_tag_1.default(_a)),
                variables: {},
                debugName: 'People Query',
            };
            return assert.isRejected(nowhere.query(doomedToFail));
            var _a;
        });
    });
    describe('query merging', function () {
        it('should merge together queries when we call batchQuery()', function (done) {
            var query1 = (_a = ["\n        query authorStuff {\n          author {\n            name\n          }\n        }"], _a.raw = ["\n        query authorStuff {\n          author {\n            name\n          }\n        }"], graphql_tag_1.default(_a));
            var query2 = (_b = ["\n        query cookieStuff {\n          fortuneCookie\n        }"], _b.raw = ["\n        query cookieStuff {\n          fortuneCookie\n        }"], graphql_tag_1.default(_b));
            var composedQuery = (_c = ["\n        query ___composed {\n          ___authorStuff___requestIndex_0___fieldIndex_0: author {\n            name\n          }\n          ___cookieStuff___requestIndex_1___fieldIndex_0: fortuneCookie\n        }"], _c.raw = ["\n        query ___composed {\n          ___authorStuff___requestIndex_0___fieldIndex_0: author {\n            name\n          }\n          ___cookieStuff___requestIndex_1___fieldIndex_0: fortuneCookie\n        }"], graphql_tag_1.default(_c));
            var request1 = { query: query1 };
            var request2 = { query: query2 };
            var myNetworkInterface = {
                query: function (request) {
                    assert.equal(printer_1.print(request.query), printer_1.print(composedQuery));
                    done();
                    return new Promise(function (resolve, reject) {
                    });
                },
            };
            var mergingNetworkInterface = networkInterface_1.addQueryMerging(myNetworkInterface);
            mergingNetworkInterface.batchQuery([request1, request2]);
            var _a, _b, _c;
        });
        it('should unpack merged query results when we call batchQuery()', function (done) {
            var query1 = (_a = ["\n        query authorStuff {\n          author {\n            name\n          }\n        }"], _a.raw = ["\n        query authorStuff {\n          author {\n            name\n          }\n        }"], graphql_tag_1.default(_a));
            var query2 = (_b = ["\n        query cookieStuff {\n          fortuneCookie\n        }"], _b.raw = ["\n        query cookieStuff {\n          fortuneCookie\n        }"], graphql_tag_1.default(_b));
            var composedQuery = (_c = ["\n        query ___composed {\n          ___authorStuff___requestIndex_0___fieldIndex_0: author {\n            name\n          }\n          ___cookieStuff___requestIndex_1___fieldIndex_0: fortuneCookie\n        }"], _c.raw = ["\n        query ___composed {\n          ___authorStuff___requestIndex_0___fieldIndex_0: author {\n            name\n          }\n          ___cookieStuff___requestIndex_1___fieldIndex_0: fortuneCookie\n        }"], graphql_tag_1.default(_c));
            var fortune = 'No snowflake in an avalanche feels responsible.';
            var result1 = {
                data: {
                    author: {
                        name: 'John Smith',
                    },
                },
            };
            var result2 = {
                data: {
                    fortuneCookie: fortune,
                },
            };
            var composedResult = {
                data: {
                    ___authorStuff___requestIndex_0___fieldIndex_0: {
                        name: 'John Smith',
                    },
                    ___cookieStuff___requestIndex_1___fieldIndex_0: fortune,
                },
            };
            var request1 = { query: query1 };
            var request2 = { query: query2 };
            var myNetworkInterface = {
                query: function (request) {
                    assert.equal(printer_1.print(request.query), printer_1.print(composedQuery));
                    return Promise.resolve(composedResult);
                },
            };
            var mergingNetworkInterface = networkInterface_1.addQueryMerging(myNetworkInterface);
            mergingNetworkInterface.batchQuery([request1, request2]).then(function (results) {
                assert.equal(results.length, 2);
                assert.deepEqual(results[0], result1);
                assert.deepEqual(results[1], result2);
                done();
            });
            var _a, _b, _c;
        });
        it('should not merge queries when batchQuery is passed a single query', function () {
            var query = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var data = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var request = { query: query };
            var myNetworkInterface = {
                query: function (requestReceived) {
                    assert.equal(printer_1.print(requestReceived.query), printer_1.print(query));
                    return Promise.resolve({ data: data });
                },
            };
            var mergingNetworkInterface = networkInterface_1.addQueryMerging(myNetworkInterface);
            mergingNetworkInterface.batchQuery([request]).then(function (results) {
                assert.equal(results.length[0], 1);
                assert.deepEqual(results[0], { data: data });
            });
            var _a;
        });
    });
});
function TestWare(variables, options) {
    if (variables === void 0) { variables = []; }
    if (options === void 0) { options = []; }
    this.applyMiddleware = function (request, next) {
        variables.map(function (variable) {
            request.request.variables[variable.key] = variable.val;
        });
        options.map(function (variable) {
            request.options[variable.key] = variable.val;
        });
        next();
    };
}
function TestAfterWare(options) {
    if (options === void 0) { options = []; }
    this.applyAfterware = function (response, next) {
        options.map(function (variable) {
            response.options[variable.key] = variable.val;
        });
        next();
    };
}
//# sourceMappingURL=networkInterface.js.map