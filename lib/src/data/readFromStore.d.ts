/// <reference types="graphql" />
import { DocumentNode } from 'graphql';
import { NormalizedCache } from './storeUtils';
import { ApolloReducerConfig } from '../store';
export declare type DiffResult = {
    result?: any;
    isMissing?: boolean;
};
export declare type ReadQueryOptions = {
    store: NormalizedCache;
    query: DocumentNode;
    variables?: Object;
    returnPartialData?: boolean;
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
export declare function readQueryFromStore({store, query, variables, returnPartialData, config}: ReadQueryOptions): Object;
export declare function diffQueryAgainstStore({store, query, variables, returnPartialData, config}: ReadQueryOptions): DiffResult;
