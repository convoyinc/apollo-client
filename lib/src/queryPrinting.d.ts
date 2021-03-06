import { OperationDefinition, VariableDefinition, Name, Document } from 'graphql';
import { SelectionSetWithRoot } from './queries/store';
import { FragmentMap } from './queries/getFromAST';
export declare function printQueryForMissingData(options: QueryDefinitionOptions): string;
export declare function printQueryFromDefinition(queryDef: OperationDefinition): string;
export declare function queryDocument({missingSelectionSets, variableDefinitions, name, fragmentMap}: QueryDocumentOptions): Document;
export declare function queryDefinition({missingSelectionSets, variableDefinitions, name}: QueryDefinitionOptions): OperationDefinition;
export declare type QueryDocumentOptions = {
    missingSelectionSets: SelectionSetWithRoot[];
    variableDefinitions?: VariableDefinition[];
    name?: Name;
    fragmentMap: FragmentMap;
};
export declare type QueryDefinitionOptions = {
    missingSelectionSets: SelectionSetWithRoot[];
    variableDefinitions?: VariableDefinition[];
    name?: Name;
};
