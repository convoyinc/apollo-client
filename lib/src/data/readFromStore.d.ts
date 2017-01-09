/// <reference types="graphql" />
import { DocumentNode } from 'graphql';
import { NormalizedCache } from './storeUtils';
import { ApolloReducerConfig } from '../store';
export declare const ID_KEY: string | symbol;
export declare type DiffResult = {
    result?: any;
    isMissing?: boolean;
};
export declare type ReadQueryOptions = {
    store: NormalizedCache;
    query: DocumentNode;
    variables?: Object;
    returnPartialData?: boolean;
    previousResult?: any;
    config?: ApolloReducerConfig;
};
export declare type CustomResolver = (rootValue: any, args: {
    [argName: string]: any;
}) => any;
export declare type CustomResolverMap = {
    [typeName: string]: {
        [fieldName: string]: CustomResolver;
    };
};
export declare function readQueryFromStore<QueryType>({returnPartialData, ...options}: ReadQueryOptions): QueryType;
export declare function diffQueryAgainstStore({store, query, variables, returnPartialData, previousResult, config}: ReadQueryOptions): DiffResult;
