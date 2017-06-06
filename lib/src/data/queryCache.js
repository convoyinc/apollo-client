var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { isEqual } from '../util/isEqual';
export function invalidateQueryCache(_a) {
    var store = _a.store, queryCache = _a.queryCache, updatedKeys = _a.updatedKeys, omitQueryIds = _a.omitQueryIds;
    var updatedQueryIds = Object.keys(queryCache).filter(function (queryId) {
        if (omitQueryIds && omitQueryIds.indexOf(queryId) >= 0) {
            return false;
        }
        if (queryCache[queryId].state === 'dirty') {
            return false;
        }
        return !updatedKeys || Object.keys(queryCache[queryId].keys).some(function (id) { return !!updatedKeys[id]; });
    });
    if (!updatedQueryIds.length) {
        return {
            data: store,
            queryCache: queryCache,
        };
    }
    var newQueryCache = __assign({}, queryCache);
    updatedQueryIds.forEach(function (queryId) {
        if (newQueryCache[queryId].state !== 'dirty') {
            newQueryCache[queryId].state = 'stale';
        }
    });
    return {
        data: store,
        queryCache: newQueryCache,
    };
}
export function removeQueryFromCache(_a) {
    var queryId = _a.queryId, store = _a.store, queryCache = _a.queryCache;
    var newQueryCache = __assign({}, queryCache);
    delete newQueryCache[queryId];
    return {
        data: store,
        queryCache: newQueryCache,
    };
}
export function insertQueryIntoCache(_a) {
    var queryId = _a.queryId, result = _a.result, _b = _a.variables, variables = _b === void 0 ? {} : _b, store = _a.store, queryCache = _a.queryCache, keys = _a.keys, updatedKeys = _a.updatedKeys, _c = _a.state, state = _c === void 0 ? 'fresh' : _c;
    if (!keys || !Object.keys(keys).length) {
        throw new Error("Trying to insert query " + queryId + " into query cache but no query cache keys are specified");
    }
    var cache = updatedKeys && Object.keys(updatedKeys).length ?
        invalidateQueryCache({ store: store, queryCache: queryCache, updatedKeys: updatedKeys, omitQueryIds: [queryId] }) :
        {
            data: store,
            queryCache: queryCache,
        };
    return {
        data: cache.data,
        queryCache: __assign({}, cache.queryCache, (_d = {}, _d[queryId] = mergeQueryCacheValue({
            result: result,
            keys: keys,
            variables: variables,
            state: state,
        }, cache.queryCache[queryId]), _d)),
    };
    var _d;
}
export function readQueryFromCache(_a) {
    var queryId = _a.queryId, queryCache = _a.queryCache, _b = _a.variables, variables = _b === void 0 ? {} : _b;
    var cachedQuery = queryCache[queryId];
    if (!cachedQuery) {
        return {
            result: null,
            dirty: false,
        };
    }
    var result = cachedQuery.state !== 'stale' && isEqual(variables, cachedQuery.variables) ? cachedQuery.result : null;
    return {
        result: result,
        dirty: cachedQuery.state === 'dirty',
    };
}
function mergeQueryCacheValue(newQueryCacheValue, oldQueryCacheValue) {
    if (!oldQueryCacheValue) {
        return newQueryCacheValue;
    }
    newQueryCacheValue.result = mergeObject(newQueryCacheValue.result, oldQueryCacheValue.result);
    return newQueryCacheValue;
}
function mergeObject(target, source) {
    if (target === source) {
        return source;
    }
    if (target != null && typeof target === 'object' && source != null && typeof source === 'object') {
        var targetFrozen = null;
        var differingKey = false;
        for (var key in target) {
            if (target.hasOwnProperty(key)) {
                if (!source.hasOwnProperty(key)) {
                    return target;
                }
                var result = mergeObject(target[key], source[key]);
                if (result !== source[key]) {
                    differingKey = true;
                }
                else {
                    if (targetFrozen === null) {
                        targetFrozen = Object.isFrozen(target);
                    }
                    if (targetFrozen) {
                        target = __assign({}, target);
                        targetFrozen = false;
                    }
                    target[key] = result;
                }
            }
        }
        if (differingKey) {
            return target;
        }
        for (var key in source) {
            if (!target.hasOwnProperty(key)) {
                return target;
            }
        }
        return source;
    }
    return target;
}
//# sourceMappingURL=queryCache.js.map