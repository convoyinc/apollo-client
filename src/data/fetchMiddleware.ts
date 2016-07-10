import every = require('lodash.every');
import has = require('lodash.has');

import {
  Field,
} from 'graphql';

import {
  NormalizedCache,
} from './store';

// Middleware that is given an opportunity to rewrite results from the store.
// It should call `next()` to look up the default value.
export type StoreFetchMiddleware = (
  field: Field,
  variables: {},
  store: NormalizedCache,
  next: () => any
) => any;

// StoreFetchMiddleware that special cases all parameterized queries containing
// either `id` or `ids` to retrieve nodes by those ids directly from the store.
//
// This allows the client to avoid an extra round trip when it is fetching a
// node by id that was previously fetched by a different query.
//
// NOTE: This middleware assumes that you are mapping data ids to the id of
// your nodes.  E.g. `dataIdFromObject: value => value.id`.
export function cachedFetchById(
  field: Field,
  variables: {},
  store: NormalizedCache,
  next: () => any
): any {
  // Note that we are careful to _not_ return an id if it doesn't exist in the
  // store!  apollo-client assumes that if an id exists in the store, the node
  // referenced must also exist.
  if (field.arguments && field.arguments.length === 1) {
    const onlyArg = field.arguments[0];
    if (onlyArg.name.value === 'id') {
      const id = variables['id'];
      if (has(store, id)) {
        return id;
      }
    } else if (onlyArg.name.value === 'ids') {
      const ids = variables['ids'];
      if (every(ids, id => has(store, id))) {
        return ids;
      }
    }
  }

  // Otherwise, fall back to the regular behavior.
  return next();
}
