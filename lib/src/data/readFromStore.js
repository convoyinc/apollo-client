var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import graphqlAnywhere from 'graphql-anywhere';
import { isJsonValue, isIdValue, } from './storeUtils';
import { storeKeyNameFromFieldNameAndArgs, } from './storeUtils';
import { getDefaultValues, getQueryDefinition, } from '../queries/getFromAST';
import { isEqual, } from '../util/isEqual';
import { assign, } from '../util/assign';
import { readQueryFromCache, } from './queryCache';
export var ID_KEY = typeof Symbol !== 'undefined' ? Symbol('id') : '@@id';
export function readQueryFromStore(options, diffResult) {
    var optsPatch = { returnPartialData: false };
    var result = diffQueryAgainstStore(__assign({}, options, optsPatch));
    if (diffResult) {
        assign(diffResult, result);
    }
    return result.result;
}
var readStoreResolver = function (fieldName, idValue, args, context, _a, queryCacheKeys, rootId) {
    var resultKey = _a.resultKey;
    assertIdValue(idValue);
    var objId = idValue.id;
    var obj = context.store[objId];
    var storeKeyName = storeKeyNameFromFieldNameAndArgs(fieldName, args);
    var fieldValue = (obj || {})[storeKeyName];
    if (queryCacheKeys) {
        if (objId === rootId) {
            queryCacheKeys[rootId + "." + storeKeyName] = true;
        }
        else {
            queryCacheKeys[objId] = true;
        }
    }
    if (typeof fieldValue === 'undefined') {
        if (context.customResolvers && obj && (obj.__typename || objId === 'ROOT_QUERY')) {
            var typename = obj.__typename || 'Query';
            var type = context.customResolvers[typename];
            if (type) {
                var resolver = type[fieldName];
                if (resolver) {
                    return resolver(obj, args);
                }
            }
        }
        if (!context.returnPartialData) {
            throw new Error("Can't find field " + storeKeyName + " on object (" + objId + ") " + JSON.stringify(obj, null, 2) + ".");
        }
        context.hasMissingField = true;
        return fieldValue;
    }
    if (isJsonValue(fieldValue)) {
        if (idValue.previousResult && isEqual(idValue.previousResult[resultKey], fieldValue.json)) {
            return idValue.previousResult[resultKey];
        }
        return fieldValue.json;
    }
    if (idValue.previousResult) {
        fieldValue = addPreviousResultToIdValues(fieldValue, idValue.previousResult[resultKey]);
    }
    return fieldValue;
};
function getReadStoreResolverWithQueryCacheKeys(queryCacheKeys, rootId) {
    return function (fieldName, idValue, args, context, execInfo) {
        return readStoreResolver(fieldName, idValue, args, context, execInfo, queryCacheKeys, rootId);
    };
}
export function diffQueryAgainstStore(_a) {
    var store = _a.store, query = _a.query, variables = _a.variables, previousResult = _a.previousResult, _b = _a.returnPartialData, returnPartialData = _b === void 0 ? true : _b, _c = _a.rootId, rootId = _c === void 0 ? 'ROOT_QUERY' : _c, fragmentMatcherFunction = _a.fragmentMatcherFunction, config = _a.config, queryCache = _a.queryCache, queryId = _a.queryId, _d = _a.returnOnlyQueryCacheData, returnOnlyQueryCacheData = _d === void 0 ? false : _d;
    var queryDefinition = getQueryDefinition(query);
    variables = assign({}, getDefaultValues(queryDefinition), variables);
    if (queryId && queryCache) {
        var _e = readQueryFromCache({ queryId: queryId, queryCache: queryCache, variables: variables }), result_1 = _e.result, dirty = _e.dirty;
        if (result_1) {
            return {
                result: result_1,
                isMissing: false,
                wasCached: true,
                wasDirty: dirty,
            };
        }
    }
    if (returnOnlyQueryCacheData) {
        return {
            result: null,
            isMissing: true,
            wasCached: false,
            wasDirty: false,
        };
    }
    var context = {
        store: store,
        returnPartialData: returnPartialData,
        customResolvers: (config && config.customResolvers) || {},
        hasMissingField: false,
    };
    var rootIdValue = {
        type: 'id',
        id: rootId,
        previousResult: previousResult,
    };
    var queryCacheKeys = {};
    var result = graphqlAnywhere(getReadStoreResolverWithQueryCacheKeys(queryCacheKeys, rootId), query, rootIdValue, context, variables, {
        fragmentMatcher: fragmentMatcherFunction,
        resultMapper: resultMapper,
    });
    return {
        result: result,
        isMissing: context.hasMissingField,
        wasCached: false,
        wasDirty: false,
        queryCacheKeys: queryCacheKeys,
    };
}
export function assertIdValue(idValue) {
    if (!isIdValue(idValue)) {
        throw new Error("Encountered a sub-selection on the query, but the store doesn't have an object reference. This should never happen during normal use unless you have custom code that is directly manipulating the store; please file an issue.");
    }
}
function addPreviousResultToIdValues(value, previousResult) {
    if (isIdValue(value)) {
        return __assign({}, value, { previousResult: previousResult });
    }
    else if (Array.isArray(value)) {
        var idToPreviousResult_1 = {};
        if (Array.isArray(previousResult)) {
            previousResult.forEach(function (item) {
                if (item && item[ID_KEY]) {
                    idToPreviousResult_1[item[ID_KEY]] = item;
                }
            });
        }
        return value.map(function (item, i) {
            var itemPreviousResult = previousResult && previousResult[i];
            if (isIdValue(item)) {
                itemPreviousResult = idToPreviousResult_1[item.id] || itemPreviousResult;
            }
            return addPreviousResultToIdValues(item, itemPreviousResult);
        });
    }
    return value;
}
function resultMapper(resultFields, idValue) {
    if (idValue.previousResult) {
        var currentResultKeys_1 = Object.keys(resultFields);
        var sameAsPreviousResult = Object.keys(idValue.previousResult)
            .reduce(function (sameKeys, key) { return sameKeys && currentResultKeys_1.indexOf(key) > -1; }, true) &&
            currentResultKeys_1.reduce(function (same, key) { return (same && areNestedArrayItemsStrictlyEqual(resultFields[key], idValue.previousResult[key])); }, true);
        if (sameAsPreviousResult) {
            return idValue.previousResult;
        }
    }
    Object.defineProperty(resultFields, ID_KEY, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: idValue.id,
    });
    return resultFields;
}
function areNestedArrayItemsStrictlyEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
        return false;
    }
    return a.reduce(function (same, item, i) { return same && areNestedArrayItemsStrictlyEqual(item, b[i]); }, true);
}
//# sourceMappingURL=readFromStore.js.map