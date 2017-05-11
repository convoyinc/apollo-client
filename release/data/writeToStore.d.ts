import { FragmentMap } from '../queries/getFromAST';
import { QueryCache, Cache } from './storeUtils';
import { SelectionSetNode, FieldNode, DocumentNode } from 'graphql';
import { FragmentMatcher } from 'graphql-anywhere';
import { NormalizedCache } from './storeUtils';
import { IdGetter } from '../core/types';
export declare function writeQueryToStore({result, query, store, variables, dataIdFromObject, fragmentMap, fragmentMatcherFunction, queryCache, queryId}: {
    result: Object;
    query: DocumentNode;
    store?: NormalizedCache;
    variables?: Object;
    dataIdFromObject?: IdGetter;
    fragmentMap?: FragmentMap;
    fragmentMatcherFunction?: FragmentMatcher;
    queryCache?: QueryCache;
    queryId?: string;
}): Cache;
export declare type WriteContext = {
    store: NormalizedCache;
    processedData?: {
        [x: string]: FieldNode[];
    };
    variables?: any;
    dataIdFromObject?: IdGetter;
    fragmentMap?: FragmentMap;
    fragmentMatcherFunction?: FragmentMatcher;
    queryCacheKeys?: {
        [id: string]: any;
    };
    updatedKeys?: {
        [id: string]: any;
    };
};
export declare function writeResultToStore({dataId, result, document, store, variables, dataIdFromObject, fragmentMatcherFunction, queryCache, queryId}: {
    dataId: string;
    result: any;
    document: DocumentNode;
    store?: NormalizedCache;
    variables?: Object;
    dataIdFromObject?: IdGetter;
    fragmentMatcherFunction?: FragmentMatcher;
    queryCache?: QueryCache;
    queryId?: string;
}): Cache;
export declare function writeSelectionSetToStore({result, dataId, selectionSet, context}: {
    dataId: string;
    result: any;
    selectionSet: SelectionSetNode;
    context: WriteContext;
}): NormalizedCache;
