"use strict";
var ObservableQuery_1 = require('./ObservableQuery');
var assign = require('lodash.assign');
var QueryScheduler = (function () {
    function QueryScheduler(_a) {
        var queryManager = _a.queryManager;
        this.queryManager = queryManager;
        this.pollingTimers = {};
        this.inFlightQueries = {};
        this.registeredQueries = {};
        this.intervalQueries = {};
    }
    QueryScheduler.prototype.checkInFlight = function (queryId) {
        return this.inFlightQueries.hasOwnProperty(queryId);
    };
    QueryScheduler.prototype.fetchQuery = function (queryId, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.queryManager.fetchQuery(queryId, options).then(function (result) {
                _this.removeInFlight(queryId);
                resolve(result);
            }).catch(function (error) {
                _this.removeInFlight(queryId);
                reject(error);
            });
            _this.addInFlight(queryId, options);
        });
    };
    QueryScheduler.prototype.startPollingQuery = function (options, queryId, firstFetch, listener) {
        if (firstFetch === void 0) { firstFetch = true; }
        if (!options.pollInterval) {
            throw new Error('Attempted to start a polling query without a polling interval.');
        }
        this.registeredQueries[queryId] = options;
        if (firstFetch) {
            this.fetchQuery(queryId, options);
        }
        if (listener) {
            this.queryManager.addQueryListener(queryId, listener);
        }
        this.addQueryOnInterval(queryId, options);
        return queryId;
    };
    QueryScheduler.prototype.stopPollingQuery = function (queryId) {
        delete this.registeredQueries[queryId];
    };
    QueryScheduler.prototype.fetchQueriesOnInterval = function (interval) {
        var _this = this;
        this.intervalQueries[interval] = this.intervalQueries[interval].filter(function (queryId) {
            if (!_this.registeredQueries.hasOwnProperty(queryId)) {
                return false;
            }
            if (_this.checkInFlight(queryId)) {
                return true;
            }
            var queryOptions = _this.registeredQueries[queryId];
            var pollingOptions = assign({}, queryOptions);
            pollingOptions.forceFetch = true;
            _this.fetchQuery(queryId, pollingOptions);
            return true;
        });
        if (this.intervalQueries[interval].length === 0) {
            clearInterval(this.pollingTimers[interval]);
        }
    };
    QueryScheduler.prototype.addQueryOnInterval = function (queryId, queryOptions) {
        var _this = this;
        var interval = queryOptions.pollInterval;
        if (this.intervalQueries.hasOwnProperty(interval.toString())) {
            this.intervalQueries[interval].push(queryId);
        }
        else {
            this.intervalQueries[interval] = [queryId];
            this.pollingTimers[interval] = setInterval(function () {
                _this.fetchQueriesOnInterval(interval);
            }, interval);
        }
    };
    QueryScheduler.prototype.registerPollingQuery = function (queryOptions) {
        if (!queryOptions.pollInterval) {
            throw new Error('Attempted to register a non-polling query with the scheduler.');
        }
        return new ObservableQuery_1.ObservableQuery({
            scheduler: this,
            options: queryOptions,
        });
    };
    QueryScheduler.prototype.addInFlight = function (queryId, options) {
        this.inFlightQueries[queryId] = options;
    };
    QueryScheduler.prototype.removeInFlight = function (queryId) {
        delete this.inFlightQueries[queryId];
    };
    return QueryScheduler;
}());
exports.QueryScheduler = QueryScheduler;
//# sourceMappingURL=scheduler.js.map