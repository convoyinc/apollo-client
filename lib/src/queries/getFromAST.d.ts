import { Document, OperationDefinition, FragmentDefinition } from 'graphql';
export declare function getMutationDefinition(doc: Document): OperationDefinition;
export declare function checkDocument(doc: Document): void;
export declare function getOperationName(doc: Document): string;
export declare function getFragmentDefinitions(doc: Document): FragmentDefinition[];
export declare function getQueryDefinition(doc: Document): OperationDefinition;
export declare function getFragmentDefinition(doc: Document): FragmentDefinition;
export interface FragmentMap {
    [fragmentName: string]: FragmentDefinition;
}
export declare function createFragmentMap(fragments?: FragmentDefinition[]): FragmentMap;
export declare function addFragmentsToDocument(queryDoc: Document, fragments: FragmentDefinition[]): Document;
