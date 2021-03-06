"use strict";
var cloneDeep = require('lodash.clonedeep');
;
var QueryBatcher = (function () {
    function QueryBatcher(_a) {
        var shouldBatch = _a.shouldBatch, networkInterface = _a.networkInterface;
        this.queuedRequests = [];
        this.shouldBatch = shouldBatch;
        this.queuedRequests = [];
        this.networkInterface = networkInterface;
    }
    QueryBatcher.prototype.enqueueRequest = function (request) {
        this.queuedRequests.push(request);
        request.promise = new Promise(function (resolve, reject) {
            request.resolve = resolve;
            request.reject = reject;
        });
        if (!this.shouldBatch) {
            this.consumeQueue();
        }
        return request.promise;
    };
    QueryBatcher.prototype.consumeQueue = function () {
        var _this = this;
        if (this.queuedRequests.length < 1) {
            return;
        }
        var requests = this.queuedRequests.map(function (queuedRequest) {
            return {
                query: queuedRequest.options.query,
                variables: queuedRequest.options.variables,
                operationName: queuedRequest.operationName,
            };
        });
        var promises = [];
        var resolvers = [];
        var rejecters = [];
        this.queuedRequests.forEach(function (fetchRequest, index) {
            promises.push(fetchRequest.promise);
            resolvers.push(fetchRequest.resolve);
            rejecters.push(fetchRequest.reject);
        });
        if (this.shouldBatch) {
            this.queuedRequests = [];
            var batchedPromise = this.networkInterface.batchQuery(requests);
            batchedPromise.then(function (results) {
                results.forEach(function (result, index) {
                    resolvers[index](result);
                });
            }).catch(function (error) {
                rejecters.forEach(function (rejecter, index) {
                    rejecters[index](error);
                });
            });
            return promises;
        }
        else {
            var clonedRequests = cloneDeep(this.queuedRequests);
            this.queuedRequests = [];
            clonedRequests.forEach(function (fetchRequest, index) {
                _this.networkInterface.query(requests[index]).then(function (result) {
                    resolvers[index](result);
                }).catch(function (reason) {
                    rejecters[index](reason);
                });
            });
            return promises;
        }
    };
    QueryBatcher.prototype.start = function (pollInterval) {
        var _this = this;
        if (this.shouldBatch) {
            this.pollInterval = pollInterval;
            this.pollTimer = setInterval(function () {
                _this.consumeQueue();
            }, this.pollInterval);
        }
    };
    QueryBatcher.prototype.stop = function () {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
        }
    };
    return QueryBatcher;
}());
exports.QueryBatcher = QueryBatcher;
//# sourceMappingURL=batching.js.map