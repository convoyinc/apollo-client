var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { omit } from 'lodash';
import { isEqual } from '../util/isEqual';
export function invalidateQueryCache(_a) {
    var store = _a.store, queryCache = _a.queryCache, updatedKeys = _a.updatedKeys, omitQueryIds = _a.omitQueryIds;
    var updatedQueryIds = Object.keys(queryCache).filter(function (queryId) { return (!omitQueryIds || omitQueryIds.indexOf(queryId) < 0) && (!updatedKeys || Object.keys(queryCache[queryId].keys).some(function (id) { return !!updatedKeys[id]; })); });
    if (!updatedQueryIds.length) {
        return {
            data: store,
            queryCache: queryCache,
        };
    }
    var newQueryCache = __assign({}, queryCache);
    updatedQueryIds.forEach(function (queryId) {
        newQueryCache[queryId].dirty = true;
    });
    return {
        data: store,
        queryCache: newQueryCache,
    };
}
export function removeQueryFromCache(_a) {
    var queryId = _a.queryId, store = _a.store, queryCache = _a.queryCache;
    return {
        data: store,
        queryCache: __assign({}, omit(queryCache, queryId)),
    };
}
export function insertQueryIntoCache(_a) {
    var queryId = _a.queryId, result = _a.result, _b = _a.variables, variables = _b === void 0 ? {} : _b, store = _a.store, queryCache = _a.queryCache, queryCacheKeys = _a.queryCacheKeys, updatedKeys = _a.updatedKeys, _c = _a.modified, modified = _c === void 0 ? false : _c;
    if (!queryCacheKeys || !Object.keys(queryCacheKeys).length) {
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
            keys: queryCacheKeys,
            variables: variables,
            dirty: false,
            modified: modified,
        }, cache.queryCache[queryId]), _d)),
    };
    var _d;
}
export function readQueryFromCache(_a) {
    var queryId = _a.queryId, queryCache = _a.queryCache, _b = _a.variables, variables = _b === void 0 ? {} : _b, _c = _a.allowModified, allowModified = _c === void 0 ? false : _c;
    var cachedQuery = queryCache[queryId];
    if (!cachedQuery) {
        return {
            result: null,
            modified: false,
        };
    }
    var result = !cachedQuery.dirty && (allowModified || !cachedQuery.modified) && isEqual(variables, cachedQuery.variables) ? cachedQuery.result : null;
    return {
        result: result,
        modified: cachedQuery.modified,
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