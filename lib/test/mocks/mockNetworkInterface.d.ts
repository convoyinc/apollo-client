import { NetworkInterface, BatchedNetworkInterface, Request } from '../../src/networkInterface';
import { GraphQLResult, Document } from 'graphql';
export default function mockNetworkInterface(...mockedResponses: MockedResponse[]): NetworkInterface;
export declare function mockBatchedNetworkInterface(...mockedResponses: MockedResponse[]): BatchedNetworkInterface;
export interface ParsedRequest {
    variables?: Object;
    query?: Document;
    debugName?: string;
}
export interface MockedResponse {
    request: ParsedRequest;
    result?: GraphQLResult;
    error?: Error;
    delay?: number;
}
export declare class MockNetworkInterface implements NetworkInterface {
    private mockedResponsesByKey;
    constructor(...mockedResponses: MockedResponse[]);
    addMockedReponse(mockedResponse: MockedResponse): void;
    query(request: Request): Promise<{}>;
}
export declare class MockBatchedNetworkInterface extends MockNetworkInterface implements BatchedNetworkInterface {
    batchQuery(requests: Request[]): Promise<GraphQLResult[]>;
}
