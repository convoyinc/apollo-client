import { NormalizedCache } from './store';
import { StoreFetchMiddleware } from './fetchMiddleware';
import { SelectionSetWithRoot } from '../queries/store';
import { SelectionSet, Document } from 'graphql';
import { FragmentMap } from '../queries/getFromAST';
export interface DiffResult {
    result: any;
    isMissing?: 'true';
    missingSelectionSets?: SelectionSetWithRoot[];
}
export interface StoreContext {
    store: NormalizedCache;
    fragmentMap: FragmentMap;
    fetchMiddleware?: StoreFetchMiddleware;
}
export declare function diffQueryAgainstStore({store, query, variables}: {
    store: NormalizedCache;
    query: Document;
    variables?: Object;
}): DiffResult;
export declare function diffFragmentAgainstStore({store, fragment, rootId, variables}: {
    store: NormalizedCache;
    fragment: Document;
    rootId: string;
    variables?: Object;
}): DiffResult;
export declare function handleFragmentErrors(fragmentErrors: {
    [typename: string]: Error;
}): void;
export declare function diffSelectionSetAgainstStore({context, selectionSet, rootId, throwOnMissingField, variables}: {
    context: StoreContext;
    selectionSet: SelectionSet;
    rootId: string;
    throwOnMissingField: boolean;
    variables: Object;
}): DiffResult;
