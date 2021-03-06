import { FragmentMap } from '../queries/getFromAST';
import { SelectionSet } from 'graphql';
export declare type StorePath = (string | number)[];
export declare function scopeJSONToResultPath({json, path}: {
    json: any;
    path: StorePath;
}): any;
export declare function scopeSelectionSetToResultPath({selectionSet, fragmentMap, path}: {
    selectionSet: SelectionSet;
    fragmentMap?: FragmentMap;
    path: StorePath;
}): SelectionSet;
