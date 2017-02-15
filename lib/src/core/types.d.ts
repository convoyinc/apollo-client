import { DocumentNode } from 'graphql';
import { QueryStoreValue } from '../queries/store';
import { NetworkStatus } from '../queries/networkStatus';
export interface SubscriptionOptions {
    document: DocumentNode;
    variables?: {
        [key: string]: any;
    };
}
export declare type QueryListener = (queryStoreValue: QueryStoreValue) => void;
export declare type PureQueryOptions = {
    query: DocumentNode;
    variables?: {
        [key: string]: any;
    };
};
export declare type ApolloQueryResult<T> = {
    data: T;
    loading: boolean;
    networkStatus: NetworkStatus;
};
export declare type ResultTransformer = (resultData: ApolloQueryResult<any>) => ApolloQueryResult<any>;
export declare type ResultComparator = (result1: ApolloQueryResult<any>, result2: ApolloQueryResult<any>) => boolean;
export declare enum FetchType {
    normal = 1,
    refetch = 2,
    poll = 3,
}
export declare type IdGetter = (value: Object) => string | null | undefined;
