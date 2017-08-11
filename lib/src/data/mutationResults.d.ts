import { ApolloExecutionResult } from '../core/types';
export declare type MutationQueryReducer<T> = (previousResult: Record<string, any>, options: {
    mutationResult: ApolloExecutionResult<T>;
    queryName: string | null;
    queryVariables: Record<string, any>;
}) => Record<string, any>;
export declare type MutationQueryReducersMap<T = {
    [key: string]: any;
}> = {
    [queryName: string]: MutationQueryReducer<T>;
};
