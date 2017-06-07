import { Cache } from './storeUtils';
import { ApolloReducerConfig } from '../store';
import { DocumentNode } from 'graphql';
export declare function replaceQueryResults(cache: Cache, {queryId, variables, document, newResult}: {
    queryId: string;
    variables: any;
    document: DocumentNode;
    newResult: Object;
}, config: ApolloReducerConfig): Cache;
