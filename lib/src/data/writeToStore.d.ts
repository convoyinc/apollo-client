import { FragmentMap } from '../queries/getFromAST';
import { SelectionSet, Document } from 'graphql';
import { NormalizedCache } from './store';
import { IdGetter } from './extensions';
export declare function writeFragmentToStore({result, fragment, store, variables, dataIdFromObject}: {
    result: Object;
    fragment: Document;
    store?: NormalizedCache;
    variables?: Object;
    dataIdFromObject?: IdGetter;
}): NormalizedCache;
export declare function writeQueryToStore({result, query, store, variables, dataIdFromObject, fragmentMap}: {
    result: Object;
    query: Document;
    store?: NormalizedCache;
    variables?: Object;
    dataIdFromObject?: IdGetter;
    fragmentMap?: FragmentMap;
}): NormalizedCache;
export declare function writeSelectionSetToStore({result, dataId, selectionSet, store, variables, dataIdFromObject, fragmentMap}: {
    dataId: string;
    result: any;
    selectionSet: SelectionSet;
    store?: NormalizedCache;
    variables: Object;
    dataIdFromObject: IdGetter;
    fragmentMap?: FragmentMap;
}): NormalizedCache;
