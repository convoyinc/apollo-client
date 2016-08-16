"use strict";
var batching_1 = require('../src/batching');
var chai_1 = require('chai');
var mockNetworkInterface_1 = require('./mocks/mockNetworkInterface');
var graphql_tag_1 = require('graphql-tag');
var networkInterface = mockNetworkInterface_1.default();
describe('QueryBatcher', function () {
    it('should construct', function () {
        chai_1.assert.doesNotThrow(function () {
            var querySched = new batching_1.QueryBatcher({
                shouldBatch: true,
                networkInterface: networkInterface,
            });
            querySched.consumeQueue();
        });
    });
    it('should not do anything when faced with an empty queue', function () {
        var batcher = new batching_1.QueryBatcher({
            shouldBatch: true,
            networkInterface: networkInterface,
        });
        chai_1.assert.equal(batcher.queuedRequests.length, 0);
        batcher.consumeQueue();
        chai_1.assert.equal(batcher.queuedRequests.length, 0);
    });
    it('should be able to add to the queue', function () {
        var batcher = new batching_1.QueryBatcher({
            shouldBatch: true,
            networkInterface: networkInterface,
        });
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var request = {
            options: { query: query },
            queryId: 'not-a-real-id',
        };
        chai_1.assert.equal(batcher.queuedRequests.length, 0);
        batcher.enqueueRequest(request);
        chai_1.assert.equal(batcher.queuedRequests.length, 1);
        batcher.enqueueRequest(request);
        chai_1.assert.equal(batcher.queuedRequests.length, 2);
        var _a;
    });
    describe('request queue', function () {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var data = {
            'author': {
                'firstName': 'John',
                'lastName': 'Smith',
            },
        };
        var myNetworkInterface = mockNetworkInterface_1.mockBatchedNetworkInterface({
            request: { query: query },
            result: { data: data },
        }, {
            request: { query: query },
            result: { data: data },
        });
        var batcher = new batching_1.QueryBatcher({
            shouldBatch: true,
            networkInterface: myNetworkInterface,
        });
        var request = {
            options: { query: query },
            queryId: 'not-a-real-id',
        };
        it('should be able to consume from a queue containing a single query', function (done) {
            var myBatcher = new batching_1.QueryBatcher({
                shouldBatch: true,
                networkInterface: myNetworkInterface,
            });
            myBatcher.enqueueRequest(request);
            var promises = myBatcher.consumeQueue();
            chai_1.assert.equal(promises.length, 1);
            promises[0].then(function (resultObj) {
                chai_1.assert.equal(myBatcher.queuedRequests.length, 0);
                chai_1.assert.deepEqual(resultObj, { data: data });
                done();
            });
        });
        it('should be able to consume from a queue containing multiple queries', function (done) {
            var request2 = {
                options: { query: query },
                queryId: 'another-fake-id',
            };
            var myBatcher = new batching_1.QueryBatcher({
                shouldBatch: true,
                networkInterface: mockNetworkInterface_1.mockBatchedNetworkInterface({
                    request: { query: query },
                    result: { data: data },
                }, {
                    request: { query: query },
                    result: { data: data },
                }),
            });
            myBatcher.enqueueRequest(request);
            myBatcher.enqueueRequest(request2);
            var promises = myBatcher.consumeQueue();
            chai_1.assert.equal(batcher.queuedRequests.length, 0);
            chai_1.assert.equal(promises.length, 2);
            promises[0].then(function (resultObj1) {
                chai_1.assert.deepEqual(resultObj1, { data: data });
                promises[1].then(function (resultObj2) {
                    chai_1.assert.deepEqual(resultObj2, { data: data });
                    done();
                });
            });
        });
        it('should return a promise when we enqueue a request and resolve it with a result', function (done) {
            var myBatcher = new batching_1.QueryBatcher({
                shouldBatch: true,
                networkInterface: mockNetworkInterface_1.mockBatchedNetworkInterface({
                    request: { query: query },
                    result: { data: data },
                }),
            });
            var promise = myBatcher.enqueueRequest(request);
            myBatcher.consumeQueue();
            promise.then(function (result) {
                chai_1.assert.deepEqual(result, { data: data });
                done();
            });
        });
        var _a;
    });
    it('should be able to stop polling', function () {
        var batcher = new batching_1.QueryBatcher({
            shouldBatch: true,
            networkInterface: networkInterface,
        });
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var request = {
            options: { query: query },
            queryId: 'not-a-real-id',
        };
        batcher.enqueueRequest(request);
        batcher.enqueueRequest(request);
        batcher.start(1000);
        batcher.stop();
        chai_1.assert.equal(batcher.queuedRequests.length, 2);
        var _a;
    });
    it('should resolve the promise returned when we enqueue with shouldBatch: false', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var myRequest = {
            options: { query: query },
            queryId: 'not-a-real-id',
        };
        var data = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var myNetworkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: data },
        });
        var batcher = new batching_1.QueryBatcher({
            shouldBatch: false,
            networkInterface: myNetworkInterface,
        });
        var promise = batcher.enqueueRequest(myRequest);
        batcher.consumeQueue();
        promise.then(function (result) {
            chai_1.assert.deepEqual(result, { data: data });
            done();
        });
        var _a;
    });
    it('should immediately consume the queue when we enqueue with shouldBatch: false', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var myRequest = {
            options: { query: query },
            queryId: 'not-a-real-id',
        };
        var data = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var myNetworkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: { data: data },
        });
        var batcher = new batching_1.QueryBatcher({
            shouldBatch: false,
            networkInterface: myNetworkInterface,
        });
        var promise = batcher.enqueueRequest(myRequest);
        promise.then(function (result) {
            chai_1.assert.deepEqual(result, { data: data });
            done();
        });
        var _a;
    });
    it('should reject the promise if there is a network error with batch:true', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var request = {
            options: { query: query },
            queryId: 'very-real-id',
        };
        var error = new Error('Network error');
        var myNetworkInterface = mockNetworkInterface_1.mockBatchedNetworkInterface({
            request: { query: query },
            error: error,
        });
        var batcher = new batching_1.QueryBatcher({
            shouldBatch: true,
            networkInterface: myNetworkInterface,
        });
        var promise = batcher.enqueueRequest(request);
        batcher.consumeQueue();
        promise.catch(function (resError) {
            chai_1.assert.equal(resError.message, 'Network error');
            done();
        });
        var _a;
    });
    it('should reject the promise if there is a network error with batch:false', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var request = {
            options: { query: query },
            queryId: 'super-real-id',
        };
        var error = new Error('Network error');
        var myNetworkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            error: error,
        });
        var batcher = new batching_1.QueryBatcher({
            shouldBatch: false,
            networkInterface: myNetworkInterface,
        });
        var promise = batcher.enqueueRequest(request);
        batcher.consumeQueue();
        promise.catch(function (resError) {
            chai_1.assert.equal(resError.message, 'Network error');
            done();
        });
        var _a;
    });
    it('should not start polling if shouldBatch is false', function (done) {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n     }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n     }"], graphql_tag_1.default(_a));
        var fetchRequest = {
            options: { query: query },
            queryId: 'super-real-id',
        };
        var batcher = new batching_1.QueryBatcher({
            shouldBatch: false,
            networkInterface: mockNetworkInterface_1.default({
                request: { query: query },
            }),
        });
        batcher.start(1);
        batcher.queuedRequests.push(fetchRequest);
        setTimeout(function () {
            chai_1.assert.equal(batcher.queuedRequests.length, 1);
            done();
        });
        var _a;
    });
});
//# sourceMappingURL=batching.js.map