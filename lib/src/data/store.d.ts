import { ApolloAction } from '../actions';
import { QueryStore } from '../queries/store';
import { MutationStore } from '../mutations/store';
import { ApolloReducerConfig } from '../store';
export interface NormalizedCache {
    [dataId: string]: StoreObject;
}
export interface StoreObject {
    __typename?: string;
    [storeFieldKey: string]: StoreValue;
}
export interface IdValue {
    type: "id";
    id: string;
    generated: boolean;
}
export interface JsonValue {
    type: "json";
    json: any;
}
export declare type StoreValue = number | string | string[] | IdValue | JsonValue;
export declare function isIdValue(idObject: StoreValue): idObject is IdValue;
export declare function isJsonValue(jsonObject: StoreValue): jsonObject is JsonValue;
export declare function data(previousState: NormalizedCache, action: ApolloAction, queries: QueryStore, mutations: MutationStore, config: ApolloReducerConfig): NormalizedCache;
