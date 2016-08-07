import { NetworkInterface } from './networkInterface';
import { ApolloStore, Store } from './store';
import { QueryStoreValue } from './queries/store';
import { QueryTransformer } from './queries/queryTransform';
import { NormalizedCache } from './data/store';
import { Document, FragmentDefinition, SelectionSet } from 'graphql';
import { StoreFetchMiddleware } from './data/fetchMiddleware';
import { MutationBehavior, MutationQueryReducersMap } from './data/mutationResults';
import { QueryScheduler } from './scheduler';
import { ApolloQueryResult } from './index';
import { Observer, Subscription } from './util/Observable';
import { WatchQueryOptions } from './watchQueryOptions';
import { ObservableQuery } from './ObservableQuery';
export declare type QueryListener = (queryStoreValue: QueryStoreValue) => void;
export declare type ResultTransformer = (resultData: ApolloQueryResult) => ApolloQueryResult;
export declare type ResultComparator = (result1: ApolloQueryResult, result2: ApolloQueryResult) => boolean;
export declare class QueryManager {
    pollingTimers: {
        [queryId: string]: NodeJS.Timer | any;
    };
    scheduler: QueryScheduler;
    store: ApolloStore;
    private networkInterface;
    private reduxRootKey;
    private queryTransformer;
    private storeFetchMiddleware;
    private resultTransformer;
    private resultComparator;
    private queryListeners;
    private queryResults;
    private idCounter;
    private batcher;
    private batchInterval;
    private fetchQueryPromises;
    private observableQueries;
    private queryIdsByName;
    constructor({networkInterface, store, reduxRootKey, queryTransformer, storeFetchMiddleware, resultTransformer, resultComparator, shouldBatch, batchInterval}: {
        networkInterface: NetworkInterface;
        store: ApolloStore;
        reduxRootKey: string;
        queryTransformer?: QueryTransformer;
        storeFetchMiddleware?: StoreFetchMiddleware;
        resultTransformer?: ResultTransformer;
        resultComparator?: ResultComparator;
        shouldBatch?: Boolean;
        batchInterval?: number;
    });
    broadcastNewStore(store: any): void;
    mutate({mutation, variables, resultBehaviors, fragments, optimisticResponse, updateQueries, refetchQueries}: {
        mutation: Document;
        variables?: Object;
        resultBehaviors?: MutationBehavior[];
        fragments?: FragmentDefinition[];
        optimisticResponse?: Object;
        updateQueries?: MutationQueryReducersMap;
        refetchQueries?: string[];
    }): Promise<ApolloQueryResult>;
    queryListenerForObserver(queryId: string, options: WatchQueryOptions, observer: Observer<ApolloQueryResult>): QueryListener;
    watchQuery(options: WatchQueryOptions, shouldSubscribe?: boolean): ObservableQuery;
    query(options: WatchQueryOptions): Promise<ApolloQueryResult>;
    fetchQuery(queryId: string, options: WatchQueryOptions): Promise<ApolloQueryResult>;
    generateQueryId(): string;
    stopQueryInStore(queryId: string): void;
    getApolloState(): Store;
    getDataWithOptimisticResults(): NormalizedCache;
    addQueryListener(queryId: string, listener: QueryListener): void;
    removeQueryListener(queryId: string): void;
    addFetchQueryPromise(requestId: number, promise: Promise<ApolloQueryResult>, resolve: (result: ApolloQueryResult) => void, reject: (error: Error) => void): void;
    removeFetchQueryPromise(requestId: number): void;
    addObservableQuery(queryId: string, observableQuery: ObservableQuery): void;
    addQuerySubscription(queryId: string, querySubscription: Subscription): void;
    removeObservableQuery(queryId: string): void;
    resetStore(): void;
    startQuery(queryId: string, options: WatchQueryOptions, listener: QueryListener): string;
    stopQuery(queryId: string): void;
    getQueryWithPreviousResult(queryId: string, isOptimistic?: boolean): {
        previousResult: Object;
        queryVariables: {
            [key: string]: any;
        };
        querySelectionSet: SelectionSet;
        queryFragments: FragmentDefinition[];
    };
    private collectResultBehaviorsFromUpdateQueries(updateQueries, mutationResult, isOptimistic?);
    private transformQueryDocument(options);
    private handleDiffQuery({queryDef, rootId, variables, fragmentMap, noFetch});
    private fetchRequest({requestId, queryId, query, querySS, options, fragmentMap, networkInterface});
    private fetchQueryOverInterface(queryId, options, networkInterface);
    private refetchQueryByName(queryName);
    private isDifferentResult(queryId, result);
    private transformResult(result);
    private broadcastQueries();
    private generateRequestId();
}
