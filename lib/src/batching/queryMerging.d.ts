import { OperationDefinition, Field, FragmentDefinition, FragmentSpread, Document, SelectionSet, VariableDefinition, Variable, GraphQLResult } from 'graphql';
import { FragmentMap } from '../queries/getFromAST';
import { Request } from '../networkInterface';
export declare function mergeRequests(requests: Request[]): Request;
export declare function unpackMergedResult(result: GraphQLResult, childRequests: Request[]): GraphQLResult[];
export declare function unpackDataForRequest({request, data, selectionSet, queryIndex, startIndex, fragmentMap, topLevel}: {
    request: Request;
    data: Object;
    selectionSet?: SelectionSet;
    queryIndex: number;
    startIndex: number;
    fragmentMap: FragmentMap;
    topLevel: boolean;
}): {
    newIndex: number;
    unpackedData: Object;
};
export declare function mergeQueryDocuments(childQueryDocs: Document[]): Document;
export declare function addVariablesToRoot(rootVariables: {
    [key: string]: any;
}, childVariables: {
    [key: string]: any;
}, childQueryDoc: Document, childQueryDocIndex: number): {
    [key: string]: any;
};
export declare function addQueryToRoot(rootQueryDoc: Document, childQueryDoc: Document, childQueryDocIndex: number): Document;
export declare function createEmptyRootQueryDoc(rootQueryName?: string): Document;
export declare function renameFragmentSpreads(selSet: SelectionSet, aliasName: string): SelectionSet;
export declare function renameVariables(selSet: SelectionSet, aliasName: string): SelectionSet;
export declare function applyAliasNameToVariableDefinition(vDef: VariableDefinition, aliasName: string): VariableDefinition;
export declare function applyAliasNameToDocument(document: Document, aliasName: string): Document;
export declare function applyAliasNameToFragment(fragment: FragmentDefinition, aliasName: string, startIndex: number): FragmentDefinition;
export declare function applyAliasNameToTopLevelFields(childQuery: OperationDefinition, aliasName: string, startIndex: number): OperationDefinition;
export declare function getVariableAliasName(varNode: Variable, aliasName: string): string;
export declare function getFragmentAliasName(fragment: FragmentDefinition | FragmentSpread, queryAliasName: string): string;
export declare function getOperationDefinitionName(operationDef: OperationDefinition, requestIndex: number): string;
export declare function aliasField(field: Field, alias: string): Field;
export declare function addPrefixToQuery(prefix: string, query: OperationDefinition): OperationDefinition;
export declare function addPrefixToVariables(prefix: string, variables: {
    [key: string]: any;
}): {
    [key: string]: any;
};
