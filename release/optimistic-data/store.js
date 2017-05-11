var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { isMutationInitAction, isMutationResultAction, isMutationErrorAction, } from '../actions';
import { data, } from '../data/store';
import { assign } from '../util/assign';
var optimisticDefaultState = [];
export function getDataWithOptimisticResults(store) {
    if (store.optimistic.length === 0) {
        return store.cache;
    }
    var cache = {
        data: assign.apply(void 0, [{}, store.cache.data].concat(store.optimistic.map(function (opt) { return opt.data; }))),
        queryCache: assign.apply(void 0, [{}, store.cache.queryCache].concat(store.optimistic.map(function (opt) { return opt.queryCache; }))),
    };
    store.optimistic.map(function (opt) { return opt.invalidatedQueryCacheIds; })
        .reduce(function (result, array) { return result.concat(array); }, [])
        .forEach(function (k) { return delete cache.queryCache[k]; });
    return cache;
}
export function optimistic(previousState, action, store, config) {
    if (previousState === void 0) { previousState = optimisticDefaultState; }
    if (isMutationInitAction(action) && action.optimisticResponse) {
        var fakeMutationResultAction = {
            type: 'APOLLO_MUTATION_RESULT',
            result: { data: action.optimisticResponse },
            document: action.mutation,
            operationName: action.operationName,
            variables: action.variables,
            mutationId: action.mutationId,
            extraReducers: action.extraReducers,
            updateQueries: action.updateQueries,
            update: action.update,
            preventStoreUpdate: action.preventStoreUpdate,
        };
        var optimisticData = getDataWithOptimisticResults(__assign({}, store, { optimistic: previousState }));
        var patch = getOptimisticDataPatch(optimisticData, fakeMutationResultAction, store.queries, store.mutations, config);
        var optimisticState = __assign({}, patch, { action: fakeMutationResultAction, mutationId: action.mutationId });
        var newState = previousState.concat([optimisticState]);
        return newState;
    }
    else if ((isMutationErrorAction(action) || isMutationResultAction(action))
        && previousState.some(function (change) { return change.mutationId === action.mutationId; })) {
        return rollbackOptimisticData(function (change) { return change.mutationId === action.mutationId; }, previousState, store, config);
    }
    return previousState;
}
function getOptimisticDataPatch(previousData, optimisticAction, queries, mutations, config) {
    var optimisticData = data(previousData, optimisticAction, queries, mutations, config);
    var patch = {
        data: {},
        queryCache: {},
        invalidatedQueryCacheIds: [],
    };
    Object.keys(optimisticData.data).forEach(function (key) {
        if (optimisticData.data[key] !== previousData.data[key]) {
            patch.data[key] = optimisticData.data[key];
        }
    });
    Object.keys(optimisticData.queryCache).forEach(function (key) {
        if (optimisticData.queryCache[key] !== previousData.queryCache[key]) {
            patch.queryCache[key] = optimisticData.queryCache[key];
        }
    });
    Object.keys(previousData.queryCache).forEach(function (key) {
        if (!optimisticData.queryCache[key]) {
            patch.invalidatedQueryCacheIds.push(key);
        }
    });
    return patch;
}
function rollbackOptimisticData(filterFn, previousState, store, config) {
    if (previousState === void 0) { previousState = optimisticDefaultState; }
    var optimisticData = {
        data: assign({}, store.cache.data),
        queryCache: assign({}, store.cache.queryCache),
    };
    var newState = previousState
        .filter(function (item) { return !filterFn(item); })
        .map(function (change) {
        var patch = getOptimisticDataPatch(optimisticData, change.action, store.queries, store.mutations, config);
        assign(optimisticData.data, patch.data);
        assign(optimisticData.queryCache, patch.queryCache);
        return __assign({}, change, patch);
    });
    return newState;
}
//# sourceMappingURL=store.js.map