/// <reference types="graphql" />
import { DocumentNode, FragmentDefinitionNode } from 'graphql';
export declare let fragmentDefinitionsMap: {
    [fragmentName: string]: FragmentDefinitionNode[];
};
export declare function createFragment(doc: DocumentNode, fragments?: (FragmentDefinitionNode[] | FragmentDefinitionNode[][]), internalUse?: boolean): FragmentDefinitionNode[];
export declare function disableFragmentWarnings(): void;
export declare function enableFragmentWarnings(): void;
export declare function clearFragmentDefinitions(): void;
