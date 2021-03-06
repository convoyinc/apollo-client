import { ApolloAction } from '../actions';
import { FragmentMap } from '../queries/getFromAST';
import { SelectionSet, GraphQLError } from 'graphql';
export interface QueryStore {
    [queryId: string]: QueryStoreValue;
}
export interface QueryStoreValue {
    queryString: string;
    query: SelectionSetWithRoot;
    minimizedQueryString: string;
    minimizedQuery: SelectionSetWithRoot;
    variables: Object;
    loading: boolean;
    networkError: Error;
    graphQLErrors: GraphQLError[];
    forceFetch: boolean;
    returnPartialData: boolean;
    lastRequestId: number;
    fragmentMap: FragmentMap;
}
export interface SelectionSetWithRoot {
    id: string;
    typeName: string;
    selectionSet: SelectionSet;
}
export declare function queries(previousState: QueryStore, action: ApolloAction): QueryStore;
