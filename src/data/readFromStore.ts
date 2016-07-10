import {
  diffSelectionSetAgainstStore,
} from './diffAgainstStore';

import {
  StoreFetchMiddleware,
} from './fetchMiddleware';

import {
  SelectionSet,
  Document,
} from 'graphql';

import {
  getQueryDefinition,
  getFragmentDefinition,
  FragmentMap,
} from '../queries/getFromAST';

import {
  NormalizedCache,
} from './store';

// import {
//   printAST,
// } from './debug';

export function readQueryFromStore({
  store,
  query,
  variables,
  returnPartialData,
  fetchMiddleware,
}: {
  store: NormalizedCache,
  query: Document,
  variables?: Object,
  returnPartialData?: boolean,
  fetchMiddleware?: StoreFetchMiddleware,
}): Object {
  const queryDef = getQueryDefinition(query);

  return readSelectionSetFromStore({
    store,
    rootId: 'ROOT_QUERY',
    selectionSet: queryDef.selectionSet,
    variables,
    returnPartialData,
    fetchMiddleware,
  });
}

export function readFragmentFromStore({
  store,
  fragment,
  rootId,
  variables,
  returnPartialData,
  fetchMiddleware,
}: {
  store: NormalizedCache,
  fragment: Document,
  rootId: string,
  variables?: Object,
  returnPartialData?: boolean,
  fetchMiddleware?: StoreFetchMiddleware,
}): Object {
  const fragmentDef = getFragmentDefinition(fragment);

  return readSelectionSetFromStore({
    store,
    rootId,
    selectionSet: fragmentDef.selectionSet,
    variables,
    returnPartialData,
    fetchMiddleware,
  });
}

export function readSelectionSetFromStore({
  store,
  rootId,
  selectionSet,
  variables,
  returnPartialData = false,
  fragmentMap,
  fetchMiddleware,
}: {
  store: NormalizedCache,
  rootId: string,
  selectionSet: SelectionSet,
  variables: Object,
  returnPartialData?: boolean,
  fragmentMap?: FragmentMap,
  fetchMiddleware?: StoreFetchMiddleware,
}): Object {
  const {
    result,
  } = diffSelectionSetAgainstStore({
    selectionSet,
    rootId,
    store,
    throwOnMissingField: !returnPartialData,
    variables,
    fragmentMap,
    fetchMiddleware,
  });

  return result;
}
