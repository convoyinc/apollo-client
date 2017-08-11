import { DocumentNode } from 'graphql';
import { DataProxy, DataProxyReadQueryOptions, DataProxyReadFragmentOptions, DataProxyWriteQueryOptions, DataProxyWriteFragmentOptions } from './proxy';
export declare type CacheWrite = {
    dataId: string;
    result: any;
    document: DocumentNode;
    variables?: Object;
};
export declare abstract class Cache implements DataProxy {
    private addTypename;
    constructor(addTypename: boolean);
    abstract reset(): Promise<void>;
    abstract diffQuery(query: {
        query: DocumentNode;
        variables: any;
        returnPartialData?: boolean;
        previousResult?: any;
        optimistic: boolean;
    }): any;
    abstract read(query: {
        query: DocumentNode;
        variables: any;
        rootId?: string;
        previousResult?: any;
        optimistic: boolean;
    }): any;
    readQuery<QueryType>(options: DataProxyReadQueryOptions, optimistic?: boolean): QueryType;
    readFragment<FragmentType>(options: DataProxyReadFragmentOptions, optimistic?: boolean): FragmentType | null;
    abstract writeResult(write: CacheWrite): void;
    writeQuery(options: DataProxyWriteQueryOptions): void;
    writeFragment(options: DataProxyWriteFragmentOptions): void;
    abstract removeOptimistic(id: string): void;
    abstract performTransaction(transaction: (c: Cache) => void): void;
    abstract recordOptimisticTransaction(transaction: (c: Cache) => void, id: string): void;
    abstract watch(query: {
        query: DocumentNode;
        variables: any;
        rootId?: string;
        previousResult?: any;
        optimistic: boolean;
    }, callback: () => void): () => void;
}
