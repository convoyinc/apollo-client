import { Field, InlineFragment, Selection, GraphQLResult } from 'graphql';
export declare function storeKeyNameFromField(field: Field, variables?: Object): string;
export declare function storeKeyNameFromFieldNameAndArgs(fieldName: string, args?: Object): string;
export declare function resultKeyNameFromField(field: Field): string;
export declare function isField(selection: Selection): selection is Field;
export declare function isInlineFragment(selection: Selection): selection is InlineFragment;
export declare function graphQLResultHasError(result: GraphQLResult): number;
