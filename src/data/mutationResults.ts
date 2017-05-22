import {
  ApolloAction,
} from '../actions';

import {QueryCacheState} from './storeUtils';

// This is part of the public API, people write these functions in `updateQueries`.
export type MutationQueryReducer = (previousResult: Object, options: {
  mutationResult: Object,
  queryName: Object,
  queryVariables: Object,
  /**
   * Performance problems may arise both as a result of writing to the store and denormalizing query results from the store. The default
   * behavior when using updateQueries is to write the updated query result to the store which potentially leads to both of these
   * performance issues.
   *
   * A workaround in order to avoid this is to change the value of on or both of the parameters provided:
   *
   * - updateStoreFlag: Prevents writing the updated query result to the store. This leaves the query cache in a dirty state (as opposed to
   * a fresh state which would be the default behavior) leading to fresh data being fetched from the server as soon as possible (when
   * calling QueryManager.fetchQuery()). Default true.
   *
   * - forceQueryCacheState: Fine grained control of the query cache state. This can be used to:
   *
   * a) mark the query cache dirty even though updateStoreFlag was kept as true. A reason for doing this could be that you've made sure
   * that the updated query result contains the most significant changes but you still want to retrieve fresh data from the server as soon
   * as applicable.
   *
   * b) keep the query cache in a fresh state even though updateStoreFlag was set to false. This most likely means that an `update`
   * function was supplied to mutate making sure that the normalized store is in sync AND that the modifications to the query result didn't
   * affect the keys of the query cache.
   *
   * c) mark all or some query caches dirty using a regexp as query name
   */
   updateStoreFlag?: boolean;
   forceQueryCacheState?: QueryCacheState;
}) => Object;

// queryName may be a regexp string. This is handy when
export type MutationQueryReducersMap = {
  [queryName: string]: MutationQueryReducer;
};
export type OperationResultReducer = (previousResult: Object, action: ApolloAction, variables: Object) => Object;
export type OperationResultReducerMap = {
  [queryId: string]: OperationResultReducer;
};
