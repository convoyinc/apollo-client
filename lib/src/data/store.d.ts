import { ApolloAction } from '../actions';
import { QueryStore } from '../queries/store';
import { MutationStore } from '../mutations/store';
import { ApolloReducerConfig } from '../store';
import { Cache } from './storeUtils';
export declare function data(previousState: Cache | undefined, action: ApolloAction, queries: QueryStore, mutations: MutationStore, config: ApolloReducerConfig): Cache;
