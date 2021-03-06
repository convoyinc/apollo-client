import { GraphQLResult, SelectionSet, FragmentDefinition } from 'graphql';
import { SelectionSetWithRoot } from './queries/store';
import { MutationBehavior } from './data/mutationResults';
import { FragmentMap } from './queries/getFromAST';
export interface QueryResultAction {
    type: 'APOLLO_QUERY_RESULT';
    result: GraphQLResult;
    queryId: string;
    requestId: number;
}
export declare function isQueryResultAction(action: ApolloAction): action is QueryResultAction;
export interface QueryErrorAction {
    type: 'APOLLO_QUERY_ERROR';
    error: Error;
    queryId: string;
    requestId: number;
}
export declare function isQueryErrorAction(action: ApolloAction): action is QueryErrorAction;
export interface QueryInitAction {
    type: 'APOLLO_QUERY_INIT';
    queryString: string;
    query: SelectionSetWithRoot;
    minimizedQueryString: string;
    minimizedQuery: SelectionSetWithRoot;
    variables: Object;
    forceFetch: boolean;
    returnPartialData: boolean;
    queryId: string;
    requestId: number;
    fragmentMap: FragmentMap;
}
export declare function isQueryInitAction(action: ApolloAction): action is QueryInitAction;
export interface QueryResultClientAction {
    type: 'APOLLO_QUERY_RESULT_CLIENT';
    result: GraphQLResult;
    complete: boolean;
    queryId: string;
}
export declare function isQueryResultClientAction(action: ApolloAction): action is QueryResultClientAction;
export interface QueryStopAction {
    type: 'APOLLO_QUERY_STOP';
    queryId: string;
}
export declare function isQueryStopAction(action: ApolloAction): action is QueryStopAction;
export interface MutationInitAction {
    type: 'APOLLO_MUTATION_INIT';
    mutationString: string;
    mutation: SelectionSetWithRoot;
    variables: Object;
    mutationId: string;
    fragmentMap: FragmentMap;
    optimisticResponse: Object;
    resultBehaviors?: MutationBehavior[];
}
export declare function isMutationInitAction(action: ApolloAction): action is MutationInitAction;
export interface MutationResultAction {
    type: 'APOLLO_MUTATION_RESULT';
    result: GraphQLResult;
    mutationId: string;
    resultBehaviors?: MutationBehavior[];
}
export declare function isMutationResultAction(action: ApolloAction): action is MutationResultAction;
export interface MutationErrorAction {
    type: 'APOLLO_MUTATION_ERROR';
    error: Error;
    mutationId: string;
}
export declare function isMutationErrorAction(action: ApolloAction): action is MutationErrorAction;
export interface UpdateQueryResultAction {
    type: 'APOLLO_UPDATE_QUERY_RESULT';
    queryVariables: any;
    querySelectionSet: SelectionSet;
    queryFragments: FragmentDefinition[];
    newResult: Object;
}
export declare function isUpdateQueryResultAction(action: ApolloAction): action is UpdateQueryResultAction;
export interface StoreResetAction {
    type: 'APOLLO_STORE_RESET';
    observableQueryIds: string[];
}
export declare function isStoreResetAction(action: ApolloAction): action is StoreResetAction;
export declare type ApolloAction = QueryResultAction | QueryErrorAction | QueryInitAction | QueryResultClientAction | QueryStopAction | MutationInitAction | MutationResultAction | MutationErrorAction | UpdateQueryResultAction | StoreResetAction;
