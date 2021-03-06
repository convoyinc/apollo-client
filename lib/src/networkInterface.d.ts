import 'whatwg-fetch';
import { GraphQLResult, Document } from 'graphql';
import { MiddlewareInterface } from './middleware';
import { AfterwareInterface } from './afterware';
export interface Request {
    debugName?: string;
    query?: Document;
    variables?: Object;
    operationName?: string;
}
export interface PrintedRequest {
    debugName?: string;
    query?: string;
    variables?: Object;
    operationName?: string;
}
export interface NetworkInterface {
    [others: string]: any;
    query(request: Request): Promise<GraphQLResult>;
}
export interface BatchedNetworkInterface extends NetworkInterface {
    batchQuery(requests: Request[]): Promise<GraphQLResult[]>;
}
export interface HTTPNetworkInterface extends BatchedNetworkInterface {
    _uri: string;
    _opts: RequestInit;
    _middlewares: MiddlewareInterface[];
    _afterwares: AfterwareInterface[];
    use(middlewares: MiddlewareInterface[]): any;
    useAfter(afterwares: AfterwareInterface[]): any;
}
export interface RequestAndOptions {
    request: Request;
    options: RequestInit;
}
export interface ResponseAndOptions {
    response: IResponse;
    options: RequestInit;
}
export declare function addQueryMerging(networkInterface: NetworkInterface): BatchedNetworkInterface;
export declare function printRequest(request: Request): PrintedRequest;
export declare function createNetworkInterface(uri: string, opts?: RequestInit): HTTPNetworkInterface;
