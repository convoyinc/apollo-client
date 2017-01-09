/// <reference types="graphql" />
import { FragmentMap } from '../queries/getFromAST';
import { SelectionSetNode } from 'graphql';
export declare type StorePath = (string | number)[];
export declare function scopeJSONToResultPath({json, path}: {
    json: any;
    path: StorePath;
}): any;
export declare function scopeSelectionSetToResultPath({selectionSet, fragmentMap, path}: {
    selectionSet: SelectionSetNode;
    fragmentMap?: FragmentMap;
    path: StorePath;
}): SelectionSetNode;
