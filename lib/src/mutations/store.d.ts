import { ApolloAction } from '../actions';
import { SelectionSet } from 'graphql';
import { FragmentMap } from '../queries/getFromAST';
export interface MutationStore {
    [mutationId: string]: MutationStoreValue;
}
export interface MutationStoreValue {
    mutationString: string;
    mutation: SelectionSetWithRoot;
    variables: Object;
    loading: boolean;
    error: Error;
    fragmentMap: FragmentMap;
}
export interface SelectionSetWithRoot {
    id: string;
    typeName: string;
    selectionSet: SelectionSet;
}
export declare function mutations(previousState: MutationStore, action: ApolloAction): MutationStore;
