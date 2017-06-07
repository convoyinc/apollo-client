import { NormalizedCache, Cache, QueryCache, QueryCacheState } from './storeUtils';
export declare function invalidateQueryCache({store, queryCache, updatedKeys, omitQueryIds}: {
    store: NormalizedCache;
    queryCache: QueryCache;
    updatedKeys?: {
        [id: string]: any;
    } | null;
    omitQueryIds?: string[];
}): Cache;
export declare function removeQueryFromCache({queryId, store, queryCache}: {
    queryId: string;
    store: NormalizedCache;
    queryCache: QueryCache;
}): Cache;
export declare function insertQueryIntoCache({queryId, result, variables, store, queryCache, keys, updatedKeys, state}: {
    queryId: string;
    result: any;
    variables?: Object;
    store: NormalizedCache;
    queryCache: QueryCache;
    keys: {
        [id: string]: any;
    };
    updatedKeys?: {
        [id: string]: any;
    };
    state?: QueryCacheState;
}): Cache;
export declare function readQueryFromCache({queryId, queryCache, variables}: {
    queryId: string;
    queryCache: QueryCache;
    variables?: Object;
}): {
    result: any;
    dirty: boolean;
};
