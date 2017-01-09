/// <reference types="graphql" />
/// <reference types="node" />
import { NetworkInterface } from '../transport/networkInterface';
import { ApolloStore, Store, ApolloReducerConfig } from '../store';
import { QueryStoreValue } from '../queries/store';
import { NormalizedCache } from '../data/storeUtils';
import { DocumentNode } from 'graphql';
import { MutationBehavior, MutationQueryReducersMap } from '../data/mutationResults';
import { QueryScheduler } from '../scheduler/scheduler';
import { ApolloStateSelector } from '../ApolloClient';
import { Observer, Observable } from '../util/Observable';
import { NetworkStatus } from '../queries/store';
import { WatchQueryOptions } from './watchQueryOptions';
import { ObservableQuery } from './ObservableQuery';
export declare type QueryListener = (queryStoreValue: QueryStoreValue) => void;
export interface SubscriptionOptions {
    document: DocumentNode;
    variables?: {
        [key: string]: any;
    };
}
export declare type ApolloQueryResult = {
    data: any;
    loading: boolean;
    networkStatus: NetworkStatus;
};
export declare type ResultTransformer = (resultData: ApolloQueryResult) => ApolloQueryResult;
export declare type ResultComparator = (result1: ApolloQueryResult, result2: ApolloQueryResult) => boolean;
export declare enum FetchType {
    normal = 1,
    refetch = 2,
    poll = 3,
}
export declare class QueryManager {
    pollingTimers: {
        [queryId: string]: NodeJS.Timer | any;
    };
    scheduler: QueryScheduler;
    store: ApolloStore;
    private addTypename;
    private networkInterface;
    private deduplicator;
    private reduxRootSelector;
    private resultTransformer;
    private resultComparator;
    private reducerConfig;
    private queryDeduplication;
    private queryListeners;
    private queryDocuments;
    private idCounter;
    private fetchQueryPromises;
    private observableQueries;
    private queryIdsByName;
    constructor({networkInterface, store, reduxRootSelector, reducerConfig, resultTransformer, resultComparator, addTypename, queryDeduplication}: {
        networkInterface: NetworkInterface;
        store: ApolloStore;
        reduxRootSelector: ApolloStateSelector;
        reducerConfig?: ApolloReducerConfig;
        resultTransformer?: ResultTransformer;
        resultComparator?: ResultComparator;
        addTypename?: boolean;
        queryDeduplication?: boolean;
    });
    broadcastNewStore(store: any): void;
    mutate({mutation, variables, resultBehaviors, optimisticResponse, updateQueries, refetchQueries}: {
        mutation: DocumentNode;
        variables?: Object;
        resultBehaviors?: MutationBehavior[];
        optimisticResponse?: Object;
        updateQueries?: MutationQueryReducersMap;
        refetchQueries?: string[];
    }): Promise<ApolloQueryResult>;
    queryListenerForObserver(queryId: string, options: WatchQueryOptions, observer: Observer<ApolloQueryResult>): QueryListener;
    watchQuery(options: WatchQueryOptions, shouldSubscribe?: boolean): ObservableQuery;
    query(options: WatchQueryOptions): Promise<ApolloQueryResult>;
    fetchQuery(queryId: string, options: WatchQueryOptions, fetchType?: FetchType): Promise<ApolloQueryResult>;
    generateQueryId(): string;
    stopQueryInStore(queryId: string): void;
    getApolloState(): Store;
    getInitialState(): {
        data: Object;
    };
    getDataWithOptimisticResults(): NormalizedCache;
    addQueryListener(queryId: string, listener: QueryListener): void;
    addFetchQueryPromise(requestId: number, promise: Promise<ApolloQueryResult>, resolve: (result: ApolloQueryResult) => void, reject: (error: Error) => void): void;
    removeFetchQueryPromise(requestId: number): void;
    addObservableQuery(queryId: string, observableQuery: ObservableQuery): void;
    removeObservableQuery(queryId: string): void;
    resetStore(): void;
    startQuery(queryId: string, options: WatchQueryOptions, listener: QueryListener): string;
    startGraphQLSubscription(options: SubscriptionOptions): Observable<any>;
    stopQuery(queryId: string): void;
    getCurrentQueryResult(observableQuery: ObservableQuery, isOptimistic?: boolean): {
        data: any;
        partial: boolean;
    };
    getQueryWithPreviousResult(queryIdOrObservable: string | ObservableQuery, isOptimistic?: boolean): {
        previousResult: any;
        variables: {
            [key: string]: any;
        };
        document: DocumentNode;
    };
    transformResult(result: ApolloQueryResult): ApolloQueryResult;
    private getQueryParts(observableQuery);
    private collectResultBehaviorsFromUpdateQueries(updateQueries, mutationResult, isOptimistic?);
    private transformQueryDocument(options);
    private getExtraReducers();
    private fetchRequest({requestId, queryId, document, options});
    private refetchQueryByName(queryName);
    private isDifferentResult(lastResult, newResult);
    private broadcastQueries();
    private generateRequestId();
}
