import { WatchQueryOptions, FetchMoreQueryOptions } from './watchQueryOptions';
import { Observable } from './util/Observable';
import { QueryScheduler } from './scheduler';
import { ApolloQueryResult } from './index';
export interface FetchMoreOptions {
    updateQuery: (previousQueryResult: Object, options: {
        fetchMoreResult: Object;
        queryVariables: Object;
    }) => Object;
}
export interface UpdateQueryOptions {
    queryVariables: Object;
}
export declare class ObservableQuery extends Observable<ApolloQueryResult> {
    refetch: (variables?: any) => Promise<ApolloQueryResult>;
    fetchMore: (options: FetchMoreQueryOptions & FetchMoreOptions) => Promise<any>;
    updateQuery: (mapFn: (previousQueryResult: any, options: UpdateQueryOptions) => any) => void;
    stopPolling: () => void;
    startPolling: (p: number) => void;
    options: WatchQueryOptions;
    queryId: string;
    private scheduler;
    private queryManager;
    constructor({scheduler, options, shouldSubscribe}: {
        scheduler: QueryScheduler;
        options: WatchQueryOptions;
        shouldSubscribe?: boolean;
    });
    result(): Promise<ApolloQueryResult>;
}
