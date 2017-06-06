import { diffQueryAgainstStore, } from './readFromStore';
import { writeResultToStore, } from './writeToStore';
export function createStoreReducer(resultReducer, document, variables, config, queryId) {
    return function (store, action) {
        var _a = diffQueryAgainstStore({
            store: store.data,
            query: document,
            variables: variables,
            returnPartialData: true,
            fragmentMatcherFunction: config.fragmentMatcher,
            config: config,
            queryCache: store.queryCache,
            queryId: queryId,
        }), result = _a.result, isMissing = _a.isMissing;
        if (isMissing) {
            return store;
        }
        var nextResult;
        try {
            nextResult = resultReducer(result, action, variables);
        }
        catch (err) {
            console.warn('Unhandled error in result reducer', err);
            throw err;
        }
        if (result !== nextResult) {
            return writeResultToStore({
                dataId: 'ROOT_QUERY',
                result: nextResult,
                store: store.data,
                document: document,
                variables: variables,
                dataIdFromObject: config.dataIdFromObject,
                fragmentMatcherFunction: config.fragmentMatcher,
                queryCache: store.queryCache,
                queryId: queryId,
            });
        }
        return store;
    };
}
//# sourceMappingURL=resultReducers.js.map