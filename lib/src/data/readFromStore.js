"use strict";
var diffAgainstStore_1 = require('./diffAgainstStore');
var getFromAST_1 = require('../queries/getFromAST');
function readQueryFromStore(_a) {
    var store = _a.store, query = _a.query, variables = _a.variables, returnPartialData = _a.returnPartialData, fragmentMap = _a.fragmentMap, fetchMiddleware = _a.fetchMiddleware;
    var queryDef = getFromAST_1.getQueryDefinition(query);
    return readSelectionSetFromStore({
        context: {
            store: store,
            fragmentMap: fragmentMap || {},
            fetchMiddleware: fetchMiddleware,
        },
        rootId: 'ROOT_QUERY',
        selectionSet: queryDef.selectionSet,
        variables: variables,
        returnPartialData: returnPartialData,
    });
}
exports.readQueryFromStore = readQueryFromStore;
function readFragmentFromStore(_a) {
    var store = _a.store, fragment = _a.fragment, rootId = _a.rootId, variables = _a.variables, returnPartialData = _a.returnPartialData;
    var fragmentDef = getFromAST_1.getFragmentDefinition(fragment);
    return readSelectionSetFromStore({
        context: { store: store, fragmentMap: {} },
        rootId: rootId,
        selectionSet: fragmentDef.selectionSet,
        variables: variables,
        returnPartialData: returnPartialData,
    });
}
exports.readFragmentFromStore = readFragmentFromStore;
function readSelectionSetFromStore(_a) {
    var context = _a.context, rootId = _a.rootId, selectionSet = _a.selectionSet, variables = _a.variables, _b = _a.returnPartialData, returnPartialData = _b === void 0 ? false : _b;
    var result = diffAgainstStore_1.diffSelectionSetAgainstStore({
        context: context,
        selectionSet: selectionSet,
        rootId: rootId,
        throwOnMissingField: !returnPartialData,
        variables: variables,
    }).result;
    return result;
}
exports.readSelectionSetFromStore = readSelectionSetFromStore;
//# sourceMappingURL=readFromStore.js.map