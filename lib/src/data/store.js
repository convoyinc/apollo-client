import { getOperationName } from '../queries/getFromAST';
import { graphQLResultHasError } from './storeUtils';
import { tryFunctionOrLogError } from '../util/errorHandling';
import { InMemoryCache } from './inMemoryCache';
var DataStore = (function () {
    function DataStore(config, initialCache) {
        if (initialCache === void 0) { initialCache = new InMemoryCache(config, {}); }
        this.config = config;
        this.cache = initialCache;
    }
    DataStore.prototype.getCache = function () {
        return this.cache;
    };
    DataStore.prototype.markQueryResult = function (queryId, requestId, result, document, variables, fetchMoreForQueryId) {
        if (!fetchMoreForQueryId && !graphQLResultHasError(result)) {
            this.cache.writeResult({
                result: result.data,
                dataId: 'ROOT_QUERY',
                document: document,
                variables: variables,
            });
        }
    };
    DataStore.prototype.markSubscriptionResult = function (subscriptionId, result, document, variables) {
        if (!graphQLResultHasError(result)) {
            this.cache.writeResult({
                result: result.data,
                dataId: 'ROOT_SUBSCRIPTION',
                document: document,
                variables: variables,
            });
        }
    };
    DataStore.prototype.markMutationInit = function (mutation) {
        var _this = this;
        if (mutation.optimisticResponse) {
            var optimistic_1;
            if (typeof mutation.optimisticResponse === 'function') {
                optimistic_1 = mutation.optimisticResponse(mutation.variables);
            }
            else {
                optimistic_1 = mutation.optimisticResponse;
            }
            var changeFn_1 = function () {
                _this.markMutationResult({
                    mutationId: mutation.mutationId,
                    result: { data: optimistic_1 },
                    document: mutation.document,
                    variables: mutation.variables,
                    updateQueries: mutation.updateQueries,
                    update: mutation.update,
                });
            };
            this.cache.recordOptimisticTransaction(function (c) {
                var orig = _this.cache;
                _this.cache = c;
                changeFn_1();
                _this.cache = orig;
            }, mutation.mutationId);
        }
    };
    DataStore.prototype.markMutationResult = function (mutation) {
        var _this = this;
        if (!mutation.result.errors) {
            var cacheWrites_1 = [];
            cacheWrites_1.push({
                result: mutation.result.data,
                dataId: 'ROOT_MUTATION',
                document: mutation.document,
                variables: mutation.variables,
            });
            if (mutation.updateQueries) {
                Object.keys(mutation.updateQueries)
                    .filter(function (id) { return mutation.updateQueries[id]; })
                    .forEach(function (queryId) {
                    var _a = mutation.updateQueries[queryId], query = _a.query, updater = _a.updater;
                    var _b = _this.cache.diffQuery({
                        query: query.document,
                        variables: query.variables,
                        returnPartialData: true,
                        optimistic: false,
                    }), currentQueryResult = _b.result, isMissing = _b.isMissing;
                    if (isMissing) {
                        return;
                    }
                    var nextQueryResult = tryFunctionOrLogError(function () {
                        return updater(currentQueryResult, {
                            mutationResult: mutation.result,
                            queryName: getOperationName(query.document),
                            queryVariables: query.variables,
                        });
                    });
                    if (nextQueryResult) {
                        cacheWrites_1.push({
                            result: nextQueryResult,
                            dataId: 'ROOT_QUERY',
                            document: query.document,
                            variables: query.variables,
                        });
                    }
                });
            }
            this.cache.performTransaction(function (c) {
                cacheWrites_1.forEach(function (write) {
                    c.writeResult(write);
                });
            });
            var update_1 = mutation.update;
            if (update_1) {
                this.cache.performTransaction(function (c) {
                    tryFunctionOrLogError(function () { return update_1(c, mutation.result); });
                });
            }
        }
    };
    DataStore.prototype.markMutationComplete = function (mutationId) {
        this.cache.removeOptimistic(mutationId);
    };
    DataStore.prototype.markUpdateQueryResult = function (document, variables, newResult) {
        this.cache.writeResult({
            result: newResult,
            dataId: 'ROOT_QUERY',
            variables: variables,
            document: document,
        });
    };
    DataStore.prototype.reset = function () {
        return this.cache.reset();
    };
    return DataStore;
}());
export { DataStore };
//# sourceMappingURL=store.js.map