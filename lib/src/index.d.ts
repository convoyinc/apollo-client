import { NetworkInterface, createNetworkInterface, addQueryMerging } from './networkInterface';
import { Document, FragmentDefinition, SelectionSet } from 'graphql';
import { print } from 'graphql-tag/printer';
import { createApolloStore, ApolloStore, createApolloReducer, ApolloReducerConfig } from './store';
import { QueryManager, ResultComparator, ResultTransformer } from './QueryManager';
import { ObservableQuery } from './ObservableQuery';
import { WatchQueryOptions } from './watchQueryOptions';
import { readQueryFromStore, readFragmentFromStore } from './data/readFromStore';
import { writeQueryToStore, writeFragmentToStore } from './data/writeToStore';
import { IdGetter } from './data/extensions';
import { QueryTransformer, addTypenameToSelectionSet } from './queries/queryTransform';
import { cachedFetchById, StoreFetchMiddleware } from './data/fetchMiddleware';
import { MutationBehaviorReducerMap } from './data/mutationResults';
export { createNetworkInterface, addQueryMerging, createApolloStore, createApolloReducer, readQueryFromStore, readFragmentFromStore, addTypenameToSelectionSet as addTypename, cachedFetchById, writeQueryToStore, writeFragmentToStore, print as printAST };
export declare type ApolloQueryResult = {
    data: any;
    loading: boolean;
};
export declare let fragmentDefinitionsMap: {
    [fragmentName: string]: FragmentDefinition[];
};
export declare function createFragment(doc: Document, fragments?: (FragmentDefinition[] | FragmentDefinition[][])): FragmentDefinition[];
export declare function disableFragmentWarnings(): void;
export declare function enableFragmentWarnings(): void;
export declare function clearFragmentDefinitions(): void;
export default class ApolloClient {
    networkInterface: NetworkInterface;
    store: ApolloStore;
    reduxRootKey: string;
    initialState: any;
    queryManager: QueryManager;
    reducerConfig: ApolloReducerConfig;
    queryTransformer: QueryTransformer;
    storeFetchMiddleware: StoreFetchMiddleware;
    resultTransformer: ResultTransformer;
    resultComparator: ResultComparator;
    shouldBatch: boolean;
    shouldForceFetch: boolean;
    dataId: IdGetter;
    fieldWithArgs: (fieldName: string, args?: Object) => string;
    batchInterval: number;
    constructor({networkInterface, reduxRootKey, initialState, dataIdFromObject, queryTransformer, storeFetchMiddleware, resultTransformer, resultComparator, shouldBatch, ssrMode, ssrForceFetchDelay, mutationBehaviorReducers, batchInterval}?: {
        networkInterface?: NetworkInterface;
        reduxRootKey?: string;
        initialState?: any;
        dataIdFromObject?: IdGetter;
        queryTransformer?: QueryTransformer;
        storeFetchMiddleware?: StoreFetchMiddleware;
        resultTransformer?: ResultTransformer;
        resultComparator?: ResultComparator;
        shouldBatch?: boolean;
        ssrMode?: boolean;
        ssrForceFetchDelay?: number;
        mutationBehaviorReducers?: MutationBehaviorReducerMap;
        batchInterval?: number;
    });
    watchQuery: (options: WatchQueryOptions) => ObservableQuery;
    query: (options: WatchQueryOptions) => Promise<{
        data: any;
        loading: boolean;
    }>;
    mutate: (options: {
        mutation: Document;
        variables?: Object;
        resultBehaviors?: ({
            type: "ARRAY_INSERT";
            resultPath: (string | number)[];
            storePath: (string | number)[];
            where: "PREPEND" | "APPEND";
        } | {
            type: "ARRAY_DELETE";
            storePath: (string | number)[];
            dataId: string;
        } | {
            type: "DELETE";
            dataId: string;
        } | {
            type: "QUERY_RESULT";
            queryVariables: any;
            querySelectionSet: SelectionSet;
            queryFragments: FragmentDefinition[];
            newResult: Object;
        })[];
        fragments?: FragmentDefinition[];
        optimisticResponse?: Object;
        updateQueries?: {
            [queryName: string]: (previousResult: Object, options: {
                mutationResult: Object;
                queryName: Object;
                queryVariables: Object;
            }) => Object;
        };
        refetchQueries?: string[];
    }) => Promise<{
        data: any;
        loading: boolean;
    }>;
    reducer(): Function;
    middleware: () => (store: ApolloStore) => (next: any) => (action: any) => any;
    initStore(): void;
    private setStore;
}
