"use strict";
var mapValues = require('lodash.mapvalues');
var isArray = require('lodash.isarray');
var cloneDeep = require('lodash.clonedeep');
var assign = require('lodash.assign');
var getFromAST_1 = require('../queries/getFromAST');
var scopeQuery_1 = require('./scopeQuery');
var writeToStore_1 = require('./writeToStore');
function mutationResultArrayInsertReducer(state, _a) {
    var behavior = _a.behavior, result = _a.result, variables = _a.variables, fragmentMap = _a.fragmentMap, selectionSet = _a.selectionSet, config = _a.config;
    var _b = behavior, resultPath = _b.resultPath, storePath = _b.storePath, where = _b.where;
    var scopedSelectionSet = scopeQuery_1.scopeSelectionSetToResultPath({
        selectionSet: selectionSet,
        fragmentMap: fragmentMap,
        path: resultPath,
    });
    var scopedResult = scopeQuery_1.scopeJSONToResultPath({
        json: result.data,
        path: resultPath,
    });
    var dataId = config.dataIdFromObject(scopedResult) || generateMutationResultDataId();
    state = writeToStore_1.writeSelectionSetToStore({
        result: scopedResult,
        dataId: dataId,
        selectionSet: scopedSelectionSet,
        store: state,
        variables: variables,
        dataIdFromObject: config.dataIdFromObject,
        fragmentMap: fragmentMap,
    });
    var dataIdOfObj = storePath[0], restStorePath = storePath.slice(1);
    var clonedObj = cloneDeep(state[dataIdOfObj]);
    var array = scopeQuery_1.scopeJSONToResultPath({
        json: clonedObj,
        path: restStorePath,
    });
    if (where === 'PREPEND') {
        array.unshift(dataId);
    }
    else if (where === 'APPEND') {
        array.push(dataId);
    }
    else {
        throw new Error('Unsupported "where" option to ARRAY_INSERT.');
    }
    return assign(state, (_c = {},
        _c[dataIdOfObj] = clonedObj,
        _c
    ));
    var _c;
}
var currId = 0;
function generateMutationResultDataId() {
    currId++;
    return "ARRAY_INSERT-gen-id-" + currId;
}
function mutationResultDeleteReducer(state, _a) {
    var behavior = _a.behavior;
    var dataId = behavior.dataId;
    delete state[dataId];
    var newState = mapValues(state, function (storeObj) {
        return removeRefsFromStoreObj(storeObj, dataId);
    });
    return newState;
}
function removeRefsFromStoreObj(storeObj, dataId) {
    var affected = false;
    var cleanedObj = mapValues(storeObj, function (value, key) {
        if (value === dataId) {
            affected = true;
            return null;
        }
        if (isArray(value)) {
            var filteredArray = cleanArray(value, dataId);
            if (filteredArray !== value) {
                affected = true;
                return filteredArray;
            }
        }
        return value;
    });
    if (affected) {
        return cleanedObj;
    }
    else {
        return storeObj;
    }
}
function cleanArray(originalArray, dataId) {
    if (originalArray.length && isArray(originalArray[0])) {
        var modified_1 = false;
        var filteredArray = originalArray.map(function (nestedArray) {
            var nestedFilteredArray = cleanArray(nestedArray, dataId);
            if (nestedFilteredArray !== nestedArray) {
                modified_1 = true;
                return nestedFilteredArray;
            }
            return nestedArray;
        });
        if (!modified_1) {
            return originalArray;
        }
        return filteredArray;
    }
    else {
        var filteredArray = originalArray.filter(function (item) { return item !== dataId; });
        if (filteredArray.length === originalArray.length) {
            return originalArray;
        }
        return filteredArray;
    }
}
exports.cleanArray = cleanArray;
function mutationResultArrayDeleteReducer(state, _a) {
    var behavior = _a.behavior;
    var _b = behavior, dataId = _b.dataId, storePath = _b.storePath;
    var dataIdOfObj = storePath[0], restStorePath = storePath.slice(1);
    var clonedObj = cloneDeep(state[dataIdOfObj]);
    var array = scopeQuery_1.scopeJSONToResultPath({
        json: clonedObj,
        path: restStorePath,
    });
    array.splice(array.indexOf(dataId), 1);
    return assign(state, (_c = {},
        _c[dataIdOfObj] = clonedObj,
        _c
    ));
    var _c;
}
function mutationResultQueryResultReducer(state, _a) {
    var behavior = _a.behavior, config = _a.config;
    var _b = behavior, queryVariables = _b.queryVariables, newResult = _b.newResult, queryFragments = _b.queryFragments, querySelectionSet = _b.querySelectionSet;
    var clonedState = assign({}, state);
    return writeToStore_1.writeSelectionSetToStore({
        result: newResult,
        dataId: 'ROOT_QUERY',
        selectionSet: querySelectionSet,
        variables: queryVariables,
        store: clonedState,
        dataIdFromObject: config.dataIdFromObject,
        fragmentMap: getFromAST_1.createFragmentMap(queryFragments),
    });
}
exports.defaultMutationBehaviorReducers = {
    'ARRAY_INSERT': mutationResultArrayInsertReducer,
    'DELETE': mutationResultDeleteReducer,
    'ARRAY_DELETE': mutationResultArrayDeleteReducer,
    'QUERY_RESULT': mutationResultQueryResultReducer,
};
//# sourceMappingURL=mutationResults.js.map