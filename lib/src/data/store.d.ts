import { QueryStoreValue } from '../queries/store';
import { MutationQueryReducer } from './mutationResults';
import { DataProxy } from '../data/proxy';
import { ApolloReducerConfig } from '../store';
import { ExecutionResult, DocumentNode } from 'graphql';
import { Cache } from './cache';
export declare type QueryWithUpdater = {
    updater: MutationQueryReducer<Object>;
    query: QueryStoreValue;
};
export interface DataWrite {
    rootId: string;
    result: any;
    document: DocumentNode;
    operationName: string | null;
    variables: Object;
}
export declare class DataStore {
    private cache;
    private config;
    constructor(config: ApolloReducerConfig, initialCache?: Cache);
    getCache(): Cache;
    markQueryResult(queryId: string, requestId: number, result: ExecutionResult, document: DocumentNode, variables: any, fetchMoreForQueryId: string | undefined): void;
    markSubscriptionResult(subscriptionId: number, result: ExecutionResult, document: DocumentNode, variables: any): void;
    markMutationInit(mutation: {
        mutationId: string;
        document: DocumentNode;
        variables: any;
        updateQueries: {
            [queryId: string]: QueryWithUpdater;
        };
        update: ((proxy: DataProxy, mutationResult: Object) => void) | undefined;
        optimisticResponse: Object | Function | undefined;
    }): void;
    markMutationResult(mutation: {
        mutationId: string;
        result: ExecutionResult;
        document: DocumentNode;
        variables: any;
        updateQueries: {
            [queryId: string]: QueryWithUpdater;
        };
        update: ((proxy: DataProxy, mutationResult: Object) => void) | undefined;
    }): void;
    markMutationComplete(mutationId: string): void;
    markUpdateQueryResult(document: DocumentNode, variables: any, newResult: any): void;
    reset(): Promise<void>;
}
