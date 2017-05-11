import { NormalizedCache, Cache, QueryCache } from './storeUtils';
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
export declare function insertQueryIntoCache({queryId, result, variables, store, queryCache, queryCacheKeys, updatedKeys, modified}: {
    queryId: string;
    result: any;
    variables?: Object;
    store: NormalizedCache;
    queryCache: QueryCache;
    queryCacheKeys: {
        [id: string]: any;
    };
    updatedKeys?: {
        [id: string]: any;
    };
    modified?: boolean;
}): Cache;
export declare function readQueryFromCache({queryId, queryCache, variables, allowModified}: {
    queryId: string;
    queryCache: QueryCache;
    variables?: Object;
    allowModified?: boolean;
}): {
    result: any;
    modified: boolean;
};
