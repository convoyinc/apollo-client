import { WatchQueryOptions } from './watchQueryOptions';
import { NetworkInterface } from './networkInterface';
import { GraphQLResult } from 'graphql';
export interface QueryFetchRequest {
    options: WatchQueryOptions;
    queryId: string;
    operationName?: string;
    promise?: Promise<GraphQLResult>;
    resolve?: (result: GraphQLResult) => void;
    reject?: (error: Error) => void;
}
export declare class QueryBatcher {
    queuedRequests: QueryFetchRequest[];
    private shouldBatch;
    private pollInterval;
    private pollTimer;
    private networkInterface;
    constructor({shouldBatch, networkInterface}: {
        shouldBatch: Boolean;
        networkInterface: NetworkInterface;
    });
    enqueueRequest(request: QueryFetchRequest): Promise<GraphQLResult>;
    consumeQueue(): Promise<GraphQLResult>[];
    start(pollInterval: Number): void;
    stop(): void;
}
