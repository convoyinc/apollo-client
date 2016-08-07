import { Field } from 'graphql';
import { NormalizedCache, StoreValue } from './store';
export declare type StoreFetchMiddleware = (field: Field, variables: {}, store: NormalizedCache, next: () => StoreValue) => StoreValue;
export declare function cachedFetchById(field: Field, variables: {}, store: NormalizedCache, next: () => StoreValue): StoreValue;
