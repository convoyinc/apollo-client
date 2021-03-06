import { StoreContext } from './diffAgainstStore';
import { StoreFetchMiddleware } from './fetchMiddleware';
import { SelectionSet, Document } from 'graphql';
import { FragmentMap } from '../queries/getFromAST';
import { NormalizedCache } from './store';
export declare function readQueryFromStore({store, query, variables, returnPartialData, fragmentMap, fetchMiddleware}: {
    store: NormalizedCache;
    query: Document;
    variables?: Object;
    returnPartialData?: boolean;
    fragmentMap?: FragmentMap;
    fetchMiddleware?: StoreFetchMiddleware;
}): Object;
export declare function readFragmentFromStore({store, fragment, rootId, variables, returnPartialData}: {
    store: NormalizedCache;
    fragment: Document;
    rootId: string;
    variables?: Object;
    returnPartialData?: boolean;
}): Object;
export declare function readSelectionSetFromStore({context, rootId, selectionSet, variables, returnPartialData}: {
    context: StoreContext;
    rootId: string;
    selectionSet: SelectionSet;
    variables: Object;
    returnPartialData?: boolean;
}): Object;
