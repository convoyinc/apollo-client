import { Document, SelectionSet } from 'graphql';
export declare type QueryTransformer = (selectionSet: SelectionSet) => void;
export declare function addFieldToSelectionSet(fieldName: string, selectionSet: SelectionSet): void;
export declare function addTypenameToSelectionSet(selectionSet: SelectionSet): void;
export declare function applyTransformers(doc: Document, queryTransformers: QueryTransformer[]): Document;
