/// <reference types="graphql" />
import { NormalizedCache } from './storeUtils';
import { DocumentNode, ExecutionResult } from 'graphql';
import { StorePath } from './scopeQuery';
import { ApolloReducerConfig } from '../store';
import { ApolloAction } from '../actions';
export declare type MutationBehavior = MutationArrayInsertBehavior | MutationArrayDeleteBehavior | MutationDeleteBehavior | MutationQueryResultBehavior;
export declare type MutationArrayInsertBehavior = {
    type: 'ARRAY_INSERT';
    resultPath: StorePath;
    storePath: StorePath;
    where: ArrayInsertWhere;
};
export declare type MutationDeleteBehavior = {
    type: 'DELETE';
    dataId: string;
};
export declare type MutationArrayDeleteBehavior = {
    type: 'ARRAY_DELETE';
    storePath: StorePath;
    dataId: string;
};
export declare type MutationQueryResultBehavior = {
    type: 'QUERY_RESULT';
    variables: any;
    document: DocumentNode;
    newResult: Object;
};
export declare type ArrayInsertWhere = 'PREPEND' | 'APPEND';
export declare type MutationBehaviorReducerArgs = {
    behavior: MutationBehavior;
    result: ExecutionResult;
    variables: any;
    document: DocumentNode;
    config: ApolloReducerConfig;
};
export declare type MutationBehaviorReducerMap = {
    [type: string]: MutationBehaviorReducer;
};
export declare type MutationBehaviorReducer = (state: NormalizedCache, args: MutationBehaviorReducerArgs) => NormalizedCache;
export declare function cleanArray(originalArray: any[], dataId: any): any[];
export declare function mutationResultQueryResultReducer(state: NormalizedCache, {behavior, config}: MutationBehaviorReducerArgs): NormalizedCache;
export declare type MutationQueryReducer = (previousResult: Object, options: {
    mutationResult: Object;
    queryName: Object;
    queryVariables: Object;
}) => Object;
export declare type MutationQueryReducersMap = {
    [queryName: string]: MutationQueryReducer;
};
export declare type OperationResultReducer = (previousResult: Object, action: ApolloAction, variables: Object) => Object;
export declare type OperationResultReducerMap = {
    [queryId: string]: OperationResultReducer;
};
export declare const defaultMutationBehaviorReducers: {
    [type: string]: MutationBehaviorReducer;
};
