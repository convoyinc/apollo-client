"use strict";
var isArray = require('lodash.isarray');
var isNull = require('lodash.isnull');
var isUndefined = require('lodash.isundefined');
var has = require('lodash.has');
var assign = require('lodash.assign');
var storeUtils_1 = require('./storeUtils');
var store_1 = require('./store');
var getFromAST_1 = require('../queries/getFromAST');
var directives_1 = require('../queries/directives');
var errors_1 = require('../errors');
function diffQueryAgainstStore(_a) {
    var store = _a.store, query = _a.query, variables = _a.variables;
    var queryDef = getFromAST_1.getQueryDefinition(query);
    return diffSelectionSetAgainstStore({
        context: { store: store, fragmentMap: {} },
        rootId: 'ROOT_QUERY',
        selectionSet: queryDef.selectionSet,
        throwOnMissingField: false,
        variables: variables,
    });
}
exports.diffQueryAgainstStore = diffQueryAgainstStore;
function diffFragmentAgainstStore(_a) {
    var store = _a.store, fragment = _a.fragment, rootId = _a.rootId, variables = _a.variables;
    var fragmentDef = getFromAST_1.getFragmentDefinition(fragment);
    return diffSelectionSetAgainstStore({
        context: { store: store, fragmentMap: {} },
        rootId: rootId,
        selectionSet: fragmentDef.selectionSet,
        throwOnMissingField: false,
        variables: variables,
    });
}
exports.diffFragmentAgainstStore = diffFragmentAgainstStore;
function handleFragmentErrors(fragmentErrors) {
    var typenames = Object.keys(fragmentErrors);
    if (typenames.length === 0) {
        return;
    }
    var errorTypes = typenames.filter(function (typename) {
        return (fragmentErrors[typename] !== null);
    });
    if (errorTypes.length === Object.keys(fragmentErrors).length) {
        throw fragmentErrors[errorTypes[0]];
    }
}
exports.handleFragmentErrors = handleFragmentErrors;
function diffSelectionSetAgainstStore(_a) {
    var context = _a.context, selectionSet = _a.selectionSet, rootId = _a.rootId, _b = _a.throwOnMissingField, throwOnMissingField = _b === void 0 ? false : _b, variables = _a.variables;
    if (selectionSet.kind !== 'SelectionSet') {
        throw new Error('Must be a selection set.');
    }
    var result = {};
    var missingFields = [];
    var fragmentErrors = {};
    selectionSet.selections.forEach(function (selection) {
        var missingFieldPushed = false;
        var fieldResult;
        var fieldIsMissing;
        function pushMissingField(missingField) {
            if (!missingFieldPushed) {
                missingFields.push(missingField);
                missingFieldPushed = true;
            }
        }
        var included = directives_1.shouldInclude(selection, variables);
        if (storeUtils_1.isField(selection)) {
            var diffResult = diffFieldAgainstStore({
                context: context,
                field: selection,
                throwOnMissingField: throwOnMissingField,
                variables: variables,
                rootId: rootId,
                included: included,
            });
            fieldIsMissing = diffResult.isMissing;
            fieldResult = diffResult.result;
            var resultFieldKey = storeUtils_1.resultKeyNameFromField(selection);
            if (fieldIsMissing) {
                pushMissingField(selection);
            }
            if (included && fieldResult !== undefined) {
                result[resultFieldKey] = fieldResult;
            }
        }
        else if (storeUtils_1.isInlineFragment(selection)) {
            var typename = selection.typeCondition.name.value;
            if (included) {
                try {
                    var diffResult = diffSelectionSetAgainstStore({
                        context: context,
                        selectionSet: selection.selectionSet,
                        throwOnMissingField: throwOnMissingField,
                        variables: variables,
                        rootId: rootId,
                    });
                    fieldIsMissing = diffResult.isMissing;
                    fieldResult = diffResult.result;
                    if (fieldIsMissing) {
                        pushMissingField(selection);
                    }
                    else {
                        assign(result, fieldResult);
                    }
                    if (!fragmentErrors[typename]) {
                        fragmentErrors[typename] = null;
                    }
                }
                catch (e) {
                    if (e.extraInfo && e.extraInfo.isFieldError) {
                        fragmentErrors[typename] = e;
                    }
                    else {
                        throw e;
                    }
                }
            }
        }
        else {
            var fragment = context.fragmentMap[selection.name.value];
            if (!fragment) {
                throw new Error("No fragment named " + selection.name.value);
            }
            var typename = fragment.typeCondition.name.value;
            if (included) {
                try {
                    var diffResult = diffSelectionSetAgainstStore({
                        context: context,
                        selectionSet: fragment.selectionSet,
                        throwOnMissingField: throwOnMissingField,
                        variables: variables,
                        rootId: rootId,
                    });
                    fieldIsMissing = diffResult.isMissing;
                    fieldResult = diffResult.result;
                    if (fieldIsMissing) {
                        pushMissingField(selection);
                    }
                    else {
                        assign(result, fieldResult);
                    }
                    if (!fragmentErrors[typename]) {
                        fragmentErrors[typename] = null;
                    }
                }
                catch (e) {
                    if (e.extraInfo && e.extraInfo.isFieldError) {
                        fragmentErrors[typename] = e;
                    }
                    else {
                        throw e;
                    }
                }
            }
        }
    });
    if (throwOnMissingField) {
        handleFragmentErrors(fragmentErrors);
    }
    var isMissing;
    var missingSelectionSets;
    if (missingFields.length) {
        if (rootId === 'ROOT_QUERY') {
            var typeName = 'Query';
            missingSelectionSets = [
                {
                    id: rootId,
                    typeName: typeName,
                    selectionSet: {
                        kind: 'SelectionSet',
                        selections: missingFields,
                    },
                },
            ];
        }
        else {
            isMissing = 'true';
        }
    }
    return {
        result: result,
        isMissing: isMissing,
        missingSelectionSets: missingSelectionSets,
    };
}
exports.diffSelectionSetAgainstStore = diffSelectionSetAgainstStore;
function diffFieldAgainstStore(_a) {
    var context = _a.context, field = _a.field, throwOnMissingField = _a.throwOnMissingField, variables = _a.variables, rootId = _a.rootId, _b = _a.included, included = _b === void 0 ? true : _b;
    var storeObj = context.store[rootId] || {};
    var storeFieldKey = storeUtils_1.storeKeyNameFromField(field, variables);
    var storeValue, fieldMissing;
    if (context.fetchMiddleware) {
        storeValue = context.fetchMiddleware(field, variables, context.store, function () { return storeObj[storeFieldKey]; });
        fieldMissing = isUndefined(storeValue);
    }
    else {
        storeValue = storeObj[storeFieldKey];
        fieldMissing = !has(storeObj, storeFieldKey);
    }
    if (fieldMissing) {
        if (throwOnMissingField && included) {
            throw new errors_1.ApolloError({
                errorMessage: "Can't find field " + storeFieldKey + " on object (" + rootId + ") " + JSON.stringify(storeObj, null, 2) + ".\nPerhaps you want to use the `returnPartialData` option?",
                extraInfo: {
                    isFieldError: true,
                },
            });
        }
        return {
            isMissing: 'true',
        };
    }
    if (!field.selectionSet) {
        if (store_1.isJsonValue(storeValue)) {
            return {
                result: storeValue.json,
            };
        }
        else {
            return {
                result: storeValue,
            };
        }
    }
    if (isNull(storeValue)) {
        return {
            result: null,
        };
    }
    if (isArray(storeValue)) {
        var isMissing_1;
        var result = storeValue.map(function (id) {
            if (isNull(id)) {
                return null;
            }
            var itemDiffResult = diffSelectionSetAgainstStore({
                context: context,
                throwOnMissingField: throwOnMissingField,
                rootId: id,
                selectionSet: field.selectionSet,
                variables: variables,
            });
            if (itemDiffResult.isMissing) {
                isMissing_1 = 'true';
            }
            return itemDiffResult.result;
        });
        return {
            result: result,
            isMissing: isMissing_1,
        };
    }
    if (store_1.isIdValue(storeValue)) {
        var unescapedId = storeValue.id;
        return diffSelectionSetAgainstStore({
            context: context,
            throwOnMissingField: throwOnMissingField,
            rootId: unescapedId,
            selectionSet: field.selectionSet,
            variables: variables,
        });
    }
    throw new Error('Unexpected value in the store where the query had a subselection.');
}
//# sourceMappingURL=diffAgainstStore.js.map