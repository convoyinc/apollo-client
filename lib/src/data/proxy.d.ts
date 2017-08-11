import { DocumentNode } from 'graphql';
export interface DataProxyReadQueryOptions {
    query: DocumentNode;
    variables?: Object;
}
export interface DataProxyReadFragmentOptions {
    id: string;
    fragment: DocumentNode;
    fragmentName?: string;
    variables?: Object;
}
export interface DataProxyWriteQueryOptions {
    data: any;
    query: DocumentNode;
    variables?: Object;
}
export interface DataProxyWriteFragmentOptions {
    data: any;
    id: string;
    fragment: DocumentNode;
    fragmentName?: string;
    variables?: Object;
}
export interface DataProxy {
    readQuery<QueryType>(options: DataProxyReadQueryOptions): QueryType;
    readFragment<FragmentType>(options: DataProxyReadFragmentOptions): FragmentType | null;
    writeQuery(options: DataProxyWriteQueryOptions): void;
    writeFragment(options: DataProxyWriteFragmentOptions): void;
}
