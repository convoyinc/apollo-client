var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { writeResultToStore, } from './writeToStore';
export function replaceQueryResults(cache, _a, config) {
    var queryId = _a.queryId, variables = _a.variables, document = _a.document, newResult = _a.newResult;
    return writeResultToStore({
        result: newResult,
        dataId: 'ROOT_QUERY',
        variables: variables,
        document: document,
        store: __assign({}, cache.data),
        dataIdFromObject: config.dataIdFromObject,
        fragmentMatcherFunction: config.fragmentMatcher,
        queryCache: cache.queryCache,
        queryId: queryId,
    });
}
//# sourceMappingURL=replaceQueryResults.js.map