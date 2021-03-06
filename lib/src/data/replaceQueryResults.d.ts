import { NormalizedCache } from './store';
import { SelectionSet, FragmentDefinition } from 'graphql';
import { ApolloReducerConfig } from '../store';
export declare function replaceQueryResults(state: NormalizedCache, {queryVariables, querySelectionSet, queryFragments, newResult}: {
    queryVariables: any;
    querySelectionSet: SelectionSet;
    queryFragments: FragmentDefinition[];
    newResult: Object;
}, config: ApolloReducerConfig): NormalizedCache;
