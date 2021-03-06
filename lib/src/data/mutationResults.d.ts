import { NormalizedCache } from './store';
import { GraphQLResult, SelectionSet, FragmentDefinition } from 'graphql';
import { FragmentMap } from '../queries/getFromAST';
import { StorePath } from './scopeQuery';
import { ApolloReducerConfig } from '../store';
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
    queryVariables: any;
    querySelectionSet: SelectionSet;
    queryFragments: FragmentDefinition[];
    newResult: Object;
};
export declare type ArrayInsertWhere = 'PREPEND' | 'APPEND';
export declare type MutationBehaviorReducerArgs = {
    behavior: MutationBehavior;
    result: GraphQLResult;
    variables: any;
    fragmentMap: FragmentMap;
    selectionSet: SelectionSet;
    config: ApolloReducerConfig;
};
export declare type MutationBehaviorReducerMap = {
    [type: string]: MutationBehaviorReducer;
};
export declare type MutationBehaviorReducer = (state: NormalizedCache, args: MutationBehaviorReducerArgs) => NormalizedCache;
export declare function cleanArray(originalArray: any, dataId: any): any;
export declare type MutationQueryReducer = (previousResult: Object, options: {
    mutationResult: Object;
    queryName: Object;
    queryVariables: Object;
}) => Object;
export declare type MutationQueryReducersMap = {
    [queryName: string]: MutationQueryReducer;
};
export declare const defaultMutationBehaviorReducers: {
    [type: string]: MutationBehaviorReducer;
};
