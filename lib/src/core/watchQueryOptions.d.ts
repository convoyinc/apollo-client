/// <reference types="graphql" />
import { DocumentNode, FragmentDefinitionNode } from 'graphql';
import { OperationResultReducer, MutationBehavior, MutationQueryReducersMap } from '../data/mutationResults';
export interface ModifiableWatchQueryOptions {
    variables?: {
        [key: string]: any;
    };
    forceFetch?: boolean;
    returnPartialData?: boolean;
    noFetch?: boolean;
    pollInterval?: number;
    notifyOnNetworkStatusChange?: boolean;
    reducer?: OperationResultReducer;
}
export interface WatchQueryOptions extends ModifiableWatchQueryOptions {
    query: DocumentNode;
    metadata?: any;
}
export interface DeprecatedWatchQueryOptions extends ModifiableWatchQueryOptions {
    query: DocumentNode;
    fragments?: FragmentDefinitionNode[];
    metadata?: any;
}
export interface FetchMoreQueryOptions {
    query?: DocumentNode;
    variables?: {
        [key: string]: any;
    };
    fragments?: FragmentDefinitionNode[];
}
export declare type SubscribeToMoreOptions = {
    document: DocumentNode;
    variables?: {
        [key: string]: any;
    };
    updateQuery: (previousQueryResult: Object, options: {
        subscriptionData: {
            data: any;
        };
        variables: {
            [key: string]: any;
        };
    }) => Object;
    onError?: (error: Error) => void;
};
export interface DeprecatedSubscriptionOptions {
    query: DocumentNode;
    variables?: {
        [key: string]: any;
    };
    fragments?: FragmentDefinitionNode[];
}
export interface MutationOptions {
    mutation: DocumentNode;
    variables?: Object;
    resultBehaviors?: MutationBehavior[];
    fragments?: FragmentDefinitionNode[];
    optimisticResponse?: Object;
    updateQueries?: MutationQueryReducersMap;
    refetchQueries?: string[];
}
