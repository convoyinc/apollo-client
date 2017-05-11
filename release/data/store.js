var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { isQueryResultAction, isMutationResultAction, isUpdateQueryResultAction, isStoreResetAction, isSubscriptionResultAction, isWriteAction, isQueryResultClientAction, isQueryStopAction, isQueryCacheAction, } from '../actions';
import { writeResultToStore, } from './writeToStore';
import { TransactionDataProxy, } from '../data/proxy';
import { getOperationName, } from '../queries/getFromAST';
import { graphQLResultHasError, } from './storeUtils';
import { replaceQueryResults, } from './replaceQueryResults';
import { diffQueryAgainstStore, } from './readFromStore';
import { tryFunctionOrLogError, } from '../util/errorHandling';
import { insertQueryIntoCache, invalidateQueryCache, } from './queryCache';
export function data(previousState, action, queries, mutations, config) {
    if (previousState === void 0) { previousState = { data: {}, queryCache: {} }; }
    var constAction = action;
    if (isQueryResultAction(action)) {
        if (!queries[action.queryId]) {
            return previousState;
        }
        if (action.requestId < queries[action.queryId].lastRequestId) {
            return previousState;
        }
        if (!graphQLResultHasError(action.result)) {
            var queryStoreValue = queries[action.queryId];
            var newState_1 = writeResultToStore({
                result: action.result.data,
                dataId: 'ROOT_QUERY',
                document: action.document,
                variables: queryStoreValue.variables,
                store: __assign({}, previousState.data),
                dataIdFromObject: config.dataIdFromObject,
                fragmentMatcherFunction: config.fragmentMatcher,
                queryCache: previousState.queryCache,
                queryId: action.queryId,
            });
            if (action.extraReducers) {
                action.extraReducers.forEach(function (reducer) {
                    newState_1 = reducer(newState_1, constAction);
                });
            }
            return compareState(previousState, newState_1);
        }
    }
    else if (isQueryResultClientAction(action)) {
        if (!action.shouldCache) {
            return previousState;
        }
        var newState = insertQueryIntoCache({
            queryId: action.queryId,
            result: action.result.data,
            variables: action.variables,
            store: previousState.data,
            queryCache: previousState.queryCache,
            queryCacheKeys: action.queryCacheKeys,
        });
        return compareState(previousState, newState);
    }
    else if (isQueryCacheAction(action)) {
        var newState = insertQueryIntoCache({
            queryId: action.queryId,
            result: action.result.data,
            variables: action.variables,
            store: previousState.data,
            queryCache: previousState.queryCache,
            queryCacheKeys: action.queryCacheKeys,
        });
        return compareState(previousState, newState);
    }
    else if (isQueryStopAction(action)) {
        if (!previousState.queryCache[action.queryId]) {
            return previousState;
        }
        return previousState;
    }
    else if (isSubscriptionResultAction(action)) {
        if (!graphQLResultHasError(action.result)) {
            var newState_2 = writeResultToStore({
                result: action.result.data,
                dataId: 'ROOT_SUBSCRIPTION',
                document: action.document,
                variables: action.variables,
                store: __assign({}, previousState.data),
                dataIdFromObject: config.dataIdFromObject,
                fragmentMatcherFunction: config.fragmentMatcher,
                queryCache: previousState.queryCache,
            });
            if (action.extraReducers) {
                action.extraReducers.forEach(function (reducer) {
                    newState_2 = reducer(newState_2, constAction);
                });
            }
            return newState_2;
        }
    }
    else if (isMutationResultAction(constAction)) {
        if (!constAction.result.errors) {
            var queryStoreValue = mutations[constAction.mutationId];
            var newState_3 = !constAction.preventStoreUpdate ? writeResultToStore({
                result: constAction.result.data,
                dataId: 'ROOT_MUTATION',
                document: constAction.document,
                variables: queryStoreValue.variables,
                store: __assign({}, previousState.data),
                dataIdFromObject: config.dataIdFromObject,
                fragmentMatcherFunction: config.fragmentMatcher,
                queryCache: previousState.queryCache,
            }) : previousState;
            var updateQueries_1 = constAction.updateQueries;
            var modifiedQueryCacheIds_1 = {};
            if (updateQueries_1) {
                Object.keys(updateQueries_1).forEach(function (queryId) {
                    var query = queries[queryId];
                    if (!query) {
                        return;
                    }
                    var _a = diffQueryAgainstStore({
                        store: previousState.data,
                        query: query.document,
                        variables: query.variables,
                        returnPartialData: true,
                        fragmentMatcherFunction: config.fragmentMatcher,
                        config: config,
                        queryCache: previousState.queryCache,
                        queryId: queryId,
                    }), currentQueryResult = _a.result, isMissing = _a.isMissing;
                    if (isMissing) {
                        return;
                    }
                    var reducer = updateQueries_1[queryId];
                    var options = {
                        mutationResult: constAction.result,
                        queryName: getOperationName(query.document),
                        queryVariables: query.variables,
                        updateStoreFlag: true,
                    };
                    var nextQueryResult = tryFunctionOrLogError(function () { return reducer(currentQueryResult, options); });
                    if (nextQueryResult) {
                        if (options.updateStoreFlag) {
                            newState_3 = writeResultToStore({
                                result: nextQueryResult,
                                dataId: 'ROOT_QUERY',
                                document: query.document,
                                variables: query.variables,
                                store: newState_3.data,
                                dataIdFromObject: config.dataIdFromObject,
                                fragmentMatcherFunction: config.fragmentMatcher,
                                queryCache: newState_3.queryCache,
                                queryId: queryId,
                            });
                        }
                        else {
                            modifiedQueryCacheIds_1[queryId] = true;
                            newState_3 = insertQueryIntoCache({
                                queryId: queryId,
                                result: nextQueryResult,
                                variables: query.variables,
                                store: newState_3.data,
                                queryCache: newState_3.queryCache,
                                queryCacheKeys: newState_3.queryCache[queryId].keys,
                                modified: true,
                            });
                        }
                    }
                });
            }
            if (constAction.update) {
                var update_1 = constAction.update;
                var proxy_1 = new TransactionDataProxy(newState_3.data, config);
                tryFunctionOrLogError(function () { return update_1(proxy_1, constAction.result); });
                var writes = proxy_1.finish();
                newState_3 = data(newState_3, { type: 'APOLLO_WRITE', writes: writes }, queries, mutations, config);
                Object.keys(modifiedQueryCacheIds_1).forEach(function (queryId) {
                    newState_3.queryCache[queryId].dirty = false;
                });
            }
            if (constAction.extraReducers) {
                constAction.extraReducers.forEach(function (reducer) {
                    newState_3 = reducer(newState_3, constAction);
                });
            }
            return compareState(previousState, newState_3);
        }
    }
    else if (isUpdateQueryResultAction(constAction)) {
        return compareState(previousState, replaceQueryResults(previousState, constAction, config));
    }
    else if (isStoreResetAction(action)) {
        return compareState(previousState, invalidateQueryCache({ store: {}, queryCache: previousState.queryCache, updatedKeys: null }));
    }
    else if (isWriteAction(action)) {
        return action.writes.reduce(function (currentState, write) { return writeResultToStore({
            result: write.result,
            dataId: write.rootId,
            document: write.document,
            variables: write.variables,
            store: __assign({}, currentState.data),
            dataIdFromObject: config.dataIdFromObject,
            fragmentMatcherFunction: config.fragmentMatcher,
            queryCache: currentState.queryCache,
        }); }, previousState);
    }
    return previousState;
}
function compareState(previousState, newState) {
    if (!newState.data) {
        newState.data = {};
    }
    if (!newState.queryCache) {
        newState.queryCache = {};
    }
    if (newState.data === previousState.data && newState.queryCache === previousState.queryCache) {
        return previousState;
    }
    return newState;
}
//# sourceMappingURL=store.js.map