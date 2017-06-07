import { ApolloAction } from '../actions';
import { QueryCacheState } from './storeUtils';
export declare type MutationQueryReducer = (previousResult: Object, options: {
    mutationResult: Object;
    queryName: Object;
    queryVariables: Object;
    updateStoreFlag?: boolean;
    forceQueryCacheState?: QueryCacheState;
}) => Object;
export declare type MutationQueryReducersMap = {
    [queryName: string]: MutationQueryReducer;
};
export declare type OperationResultReducer = (previousResult: Object, action: ApolloAction, variables: Object) => Object;
export declare type OperationResultReducerMap = {
    [queryId: string]: OperationResultReducer;
};
