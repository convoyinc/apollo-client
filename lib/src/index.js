"use strict";
var networkInterface_1 = require('./networkInterface');
exports.createNetworkInterface = networkInterface_1.createNetworkInterface;
exports.addQueryMerging = networkInterface_1.addQueryMerging;
var printer_1 = require('graphql-tag/printer');
exports.printAST = printer_1.print;
var store_1 = require('./store');
exports.createApolloStore = store_1.createApolloStore;
exports.createApolloReducer = store_1.createApolloReducer;
var QueryManager_1 = require('./QueryManager');
var readFromStore_1 = require('./data/readFromStore');
exports.readQueryFromStore = readFromStore_1.readQueryFromStore;
exports.readFragmentFromStore = readFromStore_1.readFragmentFromStore;
var writeToStore_1 = require('./data/writeToStore');
exports.writeQueryToStore = writeToStore_1.writeQueryToStore;
exports.writeFragmentToStore = writeToStore_1.writeFragmentToStore;
var queryTransform_1 = require('./queries/queryTransform');
exports.addTypename = queryTransform_1.addTypenameToSelectionSet;
var fetchMiddleware_1 = require('./data/fetchMiddleware');
exports.cachedFetchById = fetchMiddleware_1.cachedFetchById;
var storeUtils_1 = require('./data/storeUtils');
var getFromAST_1 = require('./queries/getFromAST');
var isUndefined = require('lodash.isundefined');
var assign = require('lodash.assign');
var flatten = require('lodash.flatten');
exports.fragmentDefinitionsMap = {};
var printFragmentWarnings = true;
function createFragment(doc, fragments) {
    if (fragments === void 0) { fragments = []; }
    fragments = flatten(fragments);
    var fragmentDefinitions = getFromAST_1.getFragmentDefinitions(doc);
    fragmentDefinitions.forEach(function (fragmentDefinition) {
        var fragmentName = fragmentDefinition.name.value;
        if (exports.fragmentDefinitionsMap.hasOwnProperty(fragmentName) &&
            exports.fragmentDefinitionsMap[fragmentName].indexOf(fragmentDefinition) === -1) {
            if (printFragmentWarnings) {
                console.warn("Warning: fragment with name " + fragmentDefinition.name.value + " already exists.\nApollo Client enforces all fragment names across your application to be unique; read more about\nthis in the docs: http://docs.apollostack.com/");
            }
            exports.fragmentDefinitionsMap[fragmentName].push(fragmentDefinition);
        }
        else if (!exports.fragmentDefinitionsMap.hasOwnProperty(fragmentName)) {
            exports.fragmentDefinitionsMap[fragmentName] = [fragmentDefinition];
        }
    });
    return fragments.concat(fragmentDefinitions);
}
exports.createFragment = createFragment;
function disableFragmentWarnings() {
    printFragmentWarnings = false;
}
exports.disableFragmentWarnings = disableFragmentWarnings;
function enableFragmentWarnings() {
    printFragmentWarnings = true;
}
exports.enableFragmentWarnings = enableFragmentWarnings;
function clearFragmentDefinitions() {
    exports.fragmentDefinitionsMap = {};
}
exports.clearFragmentDefinitions = clearFragmentDefinitions;
var ApolloClient = (function () {
    function ApolloClient(_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, networkInterface = _b.networkInterface, reduxRootKey = _b.reduxRootKey, initialState = _b.initialState, dataIdFromObject = _b.dataIdFromObject, queryTransformer = _b.queryTransformer, storeFetchMiddleware = _b.storeFetchMiddleware, resultTransformer = _b.resultTransformer, resultComparator = _b.resultComparator, _c = _b.shouldBatch, shouldBatch = _c === void 0 ? false : _c, _d = _b.ssrMode, ssrMode = _d === void 0 ? false : _d, _e = _b.ssrForceFetchDelay, ssrForceFetchDelay = _e === void 0 ? 0 : _e, _f = _b.mutationBehaviorReducers, mutationBehaviorReducers = _f === void 0 ? {} : _f, batchInterval = _b.batchInterval;
        this.watchQuery = function (options) {
            _this.initStore();
            if (!_this.shouldForceFetch && options.forceFetch) {
                options = assign({}, options, {
                    forceFetch: false,
                });
            }
            createFragment(options.query);
            return _this.queryManager.watchQuery(options);
        };
        this.query = function (options) {
            _this.initStore();
            if (!_this.shouldForceFetch && options.forceFetch) {
                options = assign({}, options, {
                    forceFetch: false,
                });
            }
            createFragment(options.query);
            return _this.queryManager.query(options);
        };
        this.mutate = function (options) {
            _this.initStore();
            return _this.queryManager.mutate(options);
        };
        this.middleware = function () {
            return function (store) {
                _this.setStore(store);
                return function (next) { return function (action) {
                    var returnValue = next(action);
                    _this.queryManager.broadcastNewStore(store.getState());
                    return returnValue;
                }; };
            };
        };
        this.setStore = function (store) {
            if (isUndefined(store.getState()[_this.reduxRootKey])) {
                throw new Error("Existing store does not use apolloReducer for " + _this.reduxRootKey);
            }
            _this.store = store;
            _this.queryManager = new QueryManager_1.QueryManager({
                networkInterface: _this.networkInterface,
                reduxRootKey: _this.reduxRootKey,
                store: store,
                queryTransformer: _this.queryTransformer,
                storeFetchMiddleware: _this.storeFetchMiddleware,
                resultTransformer: _this.resultTransformer,
                resultComparator: _this.resultComparator,
                shouldBatch: _this.shouldBatch,
                batchInterval: _this.batchInterval,
            });
        };
        this.reduxRootKey = reduxRootKey ? reduxRootKey : 'apollo';
        this.initialState = initialState ? initialState : {};
        this.networkInterface = networkInterface ? networkInterface :
            networkInterface_1.createNetworkInterface('/graphql');
        this.queryTransformer = queryTransformer;
        this.storeFetchMiddleware = storeFetchMiddleware;
        this.resultTransformer = resultTransformer;
        this.resultComparator = resultComparator;
        this.shouldBatch = shouldBatch;
        this.shouldForceFetch = !(ssrMode || ssrForceFetchDelay > 0);
        this.dataId = dataIdFromObject;
        this.fieldWithArgs = storeUtils_1.storeKeyNameFromFieldNameAndArgs;
        this.batchInterval = batchInterval;
        if (ssrForceFetchDelay) {
            setTimeout(function () { return _this.shouldForceFetch = true; }, ssrForceFetchDelay);
        }
        this.reducerConfig = {
            dataIdFromObject: dataIdFromObject,
            mutationBehaviorReducers: mutationBehaviorReducers,
        };
    }
    ApolloClient.prototype.reducer = function () {
        return store_1.createApolloReducer(this.reducerConfig);
    };
    ApolloClient.prototype.initStore = function () {
        if (this.store) {
            return;
        }
        this.setStore(store_1.createApolloStore({
            reduxRootKey: this.reduxRootKey,
            initialState: this.initialState,
            config: this.reducerConfig,
        }));
    };
    ;
    return ApolloClient;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ApolloClient;
//# sourceMappingURL=index.js.map