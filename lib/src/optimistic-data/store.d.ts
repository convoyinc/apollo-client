import { NormalizedCache, Cache, QueryCache } from '../data/storeUtils';
import { Store } from '../store';
export declare type OptimisticStoreItem = {
    mutationId: string;
    data: NormalizedCache;
    queryCache: QueryCache;
    invalidatedQueryCacheIds: string[];
};
export declare type OptimisticStore = OptimisticStoreItem[];
export declare function getDataWithOptimisticResults(store: Store): Cache;
export declare function optimistic(previousState: any[] | undefined, action: any, store: any, config: any): OptimisticStore;
