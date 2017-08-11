import { Cache, CacheWrite } from './cache';
import { DocumentNode } from 'graphql';
import { NormalizedCache } from './storeUtils';
import { ApolloReducerConfig } from '../store';
import { DiffResult } from './readFromStore';
export declare type OptimisticStoreItem = {
    id: string;
    data: NormalizedCache;
    transaction: (c: Cache) => void;
};
export declare class InMemoryCache extends Cache {
    private data;
    private config;
    private optimistic;
    private watches;
    constructor(config: ApolloReducerConfig, initialStore?: NormalizedCache);
    getData(): NormalizedCache;
    getOptimisticData(): NormalizedCache;
    reset(): Promise<void>;
    applyTransformer(transform: (i: NormalizedCache) => NormalizedCache): void;
    diffQuery(query: {
        query: DocumentNode;
        variables: any;
        returnPartialData?: boolean;
        previousResult?: any;
        optimistic: boolean;
    }): DiffResult;
    read(query: {
        query: DocumentNode;
        variables: any;
        rootId?: string;
        previousResult?: any;
        optimistic: boolean;
    }): any;
    writeResult(write: CacheWrite): void;
    removeOptimistic(id: string): void;
    performTransaction(transaction: (c: Cache) => void): void;
    recordOptimisticTransaction(transaction: (c: Cache) => void, id: string): void;
    watch(query: {
        query: DocumentNode;
        variables: any;
        rootId?: string;
        previousResult?: any;
        optimistic: boolean;
    }, callback: () => void): () => void;
    private broadcastWatches();
}
