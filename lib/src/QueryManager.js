"use strict";
var forOwn = require('lodash.forown');
var isEqual = require('lodash.isequal');
var store_1 = require('./store');
var getFromAST_1 = require('./queries/getFromAST');
var queryTransform_1 = require('./queries/queryTransform');
var printer_1 = require('graphql-tag/printer');
var readFromStore_1 = require('./data/readFromStore');
var diffAgainstStore_1 = require('./data/diffAgainstStore');
var queryPrinting_1 = require('./queryPrinting');
var batching_1 = require('./batching');
var scheduler_1 = require('./scheduler');
var errorHandling_1 = require('./util/errorHandling');
var errors_1 = require('./errors');
var ObservableQuery_1 = require('./ObservableQuery');
var QueryManager = (function () {
    function QueryManager(_a) {
        var _this = this;
        var networkInterface = _a.networkInterface, store = _a.store, reduxRootKey = _a.reduxRootKey, queryTransformer = _a.queryTransformer, storeFetchMiddleware = _a.storeFetchMiddleware, resultTransformer = _a.resultTransformer, resultComparator = _a.resultComparator, _b = _a.shouldBatch, shouldBatch = _b === void 0 ? false : _b, _c = _a.batchInterval, batchInterval = _c === void 0 ? 10 : _c;
        this.idCounter = 0;
        this.networkInterface = networkInterface;
        this.store = store;
        this.reduxRootKey = reduxRootKey;
        this.queryTransformer = queryTransformer;
        this.storeFetchMiddleware = storeFetchMiddleware;
        this.resultTransformer = resultTransformer;
        this.resultComparator = resultComparator;
        this.pollingTimers = {};
        this.batchInterval = batchInterval;
        this.queryListeners = {};
        this.queryResults = {};
        this.scheduler = new scheduler_1.QueryScheduler({
            queryManager: this,
        });
        this.batcher = new batching_1.QueryBatcher({
            shouldBatch: shouldBatch,
            networkInterface: this.networkInterface,
        });
        this.batcher.start(this.batchInterval);
        this.fetchQueryPromises = {};
        this.observableQueries = {};
        this.queryIdsByName = {};
        if (this.store['subscribe']) {
            var currentStoreData_1;
            this.store['subscribe'](function () {
                var previousStoreData = currentStoreData_1 || {};
                var previousStoreHasData = Object.keys(previousStoreData).length;
                currentStoreData_1 = _this.getApolloState();
                if (isEqual(previousStoreData, currentStoreData_1) && previousStoreHasData) {
                    return;
                }
                _this.broadcastQueries();
            });
        }
    }
    QueryManager.prototype.broadcastNewStore = function (store) {
        this.broadcastQueries();
    };
    QueryManager.prototype.mutate = function (_a) {
        var _this = this;
        var mutation = _a.mutation, variables = _a.variables, _b = _a.resultBehaviors, resultBehaviors = _b === void 0 ? [] : _b, _c = _a.fragments, fragments = _c === void 0 ? [] : _c, optimisticResponse = _a.optimisticResponse, updateQueries = _a.updateQueries, _d = _a.refetchQueries, refetchQueries = _d === void 0 ? [] : _d;
        var mutationId = this.generateQueryId();
        mutation = getFromAST_1.addFragmentsToDocument(mutation, fragments);
        if (this.queryTransformer) {
            mutation = queryTransform_1.applyTransformers(mutation, [this.queryTransformer]);
        }
        var mutationDef = getFromAST_1.getMutationDefinition(mutation);
        var mutationString = printer_1.print(mutation);
        var queryFragmentMap = getFromAST_1.createFragmentMap(getFromAST_1.getFragmentDefinitions(mutation));
        var request = {
            query: mutation,
            variables: variables,
            operationName: getFromAST_1.getOperationName(mutation),
        };
        var updateQueriesResultBehaviors = !optimisticResponse ? [] :
            this.collectResultBehaviorsFromUpdateQueries(updateQueries, { data: optimisticResponse }, true);
        this.store.dispatch({
            type: 'APOLLO_MUTATION_INIT',
            mutationString: mutationString,
            mutation: {
                id: 'ROOT_MUTATION',
                typeName: 'Mutation',
                selectionSet: mutationDef.selectionSet,
            },
            variables: variables,
            mutationId: mutationId,
            fragmentMap: queryFragmentMap,
            optimisticResponse: optimisticResponse,
            resultBehaviors: resultBehaviors.concat(updateQueriesResultBehaviors),
        });
        return new Promise(function (resolve, reject) {
            _this.networkInterface.query(request)
                .then(function (result) {
                if (result.errors) {
                    reject(new errors_1.ApolloError({
                        graphQLErrors: result.errors,
                    }));
                }
                _this.store.dispatch({
                    type: 'APOLLO_MUTATION_RESULT',
                    result: result,
                    mutationId: mutationId,
                    resultBehaviors: resultBehaviors.concat(_this.collectResultBehaviorsFromUpdateQueries(updateQueries, result)),
                });
                refetchQueries.forEach(function (name) { _this.refetchQueryByName(name); });
                resolve(_this.transformResult(result));
            })
                .catch(function (err) {
                _this.store.dispatch({
                    type: 'APOLLO_MUTATION_ERROR',
                    error: err,
                    mutationId: mutationId,
                });
                reject(new errors_1.ApolloError({
                    networkError: err,
                }));
            });
        });
    };
    QueryManager.prototype.queryListenerForObserver = function (queryId, options, observer) {
        var _this = this;
        return function (queryStoreValue) {
            if (!queryStoreValue) {
                return;
            }
            if (!queryStoreValue.loading || queryStoreValue.returnPartialData) {
                if (queryStoreValue.graphQLErrors || queryStoreValue.networkError) {
                    var apolloError = new errors_1.ApolloError({
                        graphQLErrors: queryStoreValue.graphQLErrors,
                        networkError: queryStoreValue.networkError,
                    });
                    if (observer.error) {
                        observer.error(apolloError);
                    }
                    else {
                        console.error('Unhandled error', apolloError, apolloError.stack);
                    }
                }
                else {
                    try {
                        var resultFromStore = {
                            data: readFromStore_1.readSelectionSetFromStore({
                                context: {
                                    store: _this.getDataWithOptimisticResults(),
                                    fragmentMap: queryStoreValue.fragmentMap,
                                    fetchMiddleware: _this.storeFetchMiddleware,
                                },
                                rootId: queryStoreValue.query.id,
                                selectionSet: queryStoreValue.query.selectionSet,
                                variables: queryStoreValue.variables,
                                returnPartialData: options.returnPartialData || options.noFetch,
                            }),
                            loading: queryStoreValue.loading,
                        };
                        if (observer.next) {
                            if (_this.isDifferentResult(queryId, resultFromStore)) {
                                _this.queryResults[queryId] = resultFromStore;
                                observer.next(_this.transformResult(resultFromStore));
                            }
                        }
                    }
                    catch (error) {
                        if (observer.error) {
                            observer.error(error);
                        }
                    }
                }
            }
        };
    };
    QueryManager.prototype.watchQuery = function (options, shouldSubscribe) {
        if (shouldSubscribe === void 0) { shouldSubscribe = true; }
        getFromAST_1.getQueryDefinition(options.query);
        var observableQuery = new ObservableQuery_1.ObservableQuery({
            scheduler: this.scheduler,
            options: options,
            shouldSubscribe: shouldSubscribe,
        });
        return observableQuery;
    };
    QueryManager.prototype.query = function (options) {
        var _this = this;
        if (options.returnPartialData) {
            throw new Error('returnPartialData option only supported on watchQuery.');
        }
        if (options.query.kind !== 'Document') {
            throw new Error('You must wrap the query string in a "gql" tag.');
        }
        var requestId = this.idCounter;
        var resPromise = new Promise(function (resolve, reject) {
            _this.addFetchQueryPromise(requestId, resPromise, resolve, reject);
            return _this.watchQuery(options, false).result().then(function (result) {
                _this.removeFetchQueryPromise(requestId);
                resolve(result);
            }).catch(function (error) {
                _this.removeFetchQueryPromise(requestId);
                reject(error);
            });
        });
        return resPromise;
    };
    QueryManager.prototype.fetchQuery = function (queryId, options) {
        return this.fetchQueryOverInterface(queryId, options, this.networkInterface);
    };
    QueryManager.prototype.generateQueryId = function () {
        var queryId = this.idCounter.toString();
        this.idCounter++;
        return queryId;
    };
    QueryManager.prototype.stopQueryInStore = function (queryId) {
        this.store.dispatch({
            type: 'APOLLO_QUERY_STOP',
            queryId: queryId,
        });
    };
    ;
    QueryManager.prototype.getApolloState = function () {
        return this.store.getState()[this.reduxRootKey];
    };
    QueryManager.prototype.getDataWithOptimisticResults = function () {
        return store_1.getDataWithOptimisticResults(this.getApolloState());
    };
    QueryManager.prototype.addQueryListener = function (queryId, listener) {
        this.queryListeners[queryId] = listener;
    };
    ;
    QueryManager.prototype.removeQueryListener = function (queryId) {
        delete this.queryListeners[queryId];
    };
    QueryManager.prototype.addFetchQueryPromise = function (requestId, promise, resolve, reject) {
        this.fetchQueryPromises[requestId.toString()] = { promise: promise, resolve: resolve, reject: reject };
    };
    QueryManager.prototype.removeFetchQueryPromise = function (requestId) {
        delete this.fetchQueryPromises[requestId.toString()];
    };
    QueryManager.prototype.addObservableQuery = function (queryId, observableQuery) {
        this.observableQueries[queryId] = { observableQuery: observableQuery, subscriptions: [] };
        var queryDef = getFromAST_1.getQueryDefinition(observableQuery.options.query);
        if (queryDef.name && queryDef.name.value) {
            var queryName = getFromAST_1.getQueryDefinition(observableQuery.options.query).name.value;
            this.queryIdsByName[queryName] = this.queryIdsByName[queryName] || [];
            this.queryIdsByName[queryName].push(observableQuery.queryId);
        }
    };
    QueryManager.prototype.addQuerySubscription = function (queryId, querySubscription) {
        if (this.observableQueries.hasOwnProperty(queryId)) {
            this.observableQueries[queryId].subscriptions.push(querySubscription);
        }
        else {
            this.observableQueries[queryId] = {
                observableQuery: null,
                subscriptions: [querySubscription],
            };
        }
    };
    QueryManager.prototype.removeObservableQuery = function (queryId) {
        var observableQuery = this.observableQueries[queryId].observableQuery;
        var queryName = getFromAST_1.getQueryDefinition(observableQuery.options.query).name.value;
        delete this.observableQueries[queryId];
        this.queryIdsByName[queryName] = this.queryIdsByName[queryName].filter(function (val) {
            return !(observableQuery.queryId === val);
        });
    };
    QueryManager.prototype.resetStore = function () {
        var _this = this;
        Object.keys(this.fetchQueryPromises).forEach(function (key) {
            var reject = _this.fetchQueryPromises[key].reject;
            reject(new Error('Store reset while query was in flight.'));
        });
        this.store.dispatch({
            type: 'APOLLO_STORE_RESET',
            observableQueryIds: Object.keys(this.observableQueries),
        });
        Object.keys(this.observableQueries).forEach(function (queryId) {
            if (!_this.observableQueries[queryId].observableQuery.options.noFetch) {
                _this.observableQueries[queryId].observableQuery.refetch();
            }
        });
    };
    QueryManager.prototype.startQuery = function (queryId, options, listener) {
        this.queryListeners[queryId] = listener;
        if (!options.pollInterval) {
            this.fetchQuery(queryId, options);
        }
        return queryId;
    };
    QueryManager.prototype.stopQuery = function (queryId) {
        delete this.queryListeners[queryId];
        this.stopQueryInStore(queryId);
    };
    QueryManager.prototype.getQueryWithPreviousResult = function (queryId, isOptimistic) {
        if (isOptimistic === void 0) { isOptimistic = false; }
        if (!this.observableQueries[queryId]) {
            throw new Error("ObservableQuery with this id doesn't exist: " + queryId);
        }
        var observableQuery = this.observableQueries[queryId].observableQuery;
        var queryOptions = observableQuery.options;
        var fragments = queryOptions.fragments;
        var queryDefinition = getFromAST_1.getQueryDefinition(queryOptions.query);
        if (this.queryTransformer) {
            var doc = {
                kind: 'Document',
                definitions: [
                    queryDefinition
                ].concat((fragments || [])),
            };
            var transformedDoc = queryTransform_1.applyTransformers(doc, [this.queryTransformer]);
            queryDefinition = getFromAST_1.getQueryDefinition(transformedDoc);
            fragments = getFromAST_1.getFragmentDefinitions(transformedDoc);
        }
        var previousResult = readFromStore_1.readSelectionSetFromStore({
            context: {
                store: isOptimistic ? this.getDataWithOptimisticResults() : this.getApolloState().data,
                fragmentMap: getFromAST_1.createFragmentMap(fragments || []),
            },
            rootId: 'ROOT_QUERY',
            selectionSet: queryDefinition.selectionSet,
            variables: queryOptions.variables,
            returnPartialData: queryOptions.returnPartialData || queryOptions.noFetch,
        });
        return {
            previousResult: previousResult,
            queryVariables: queryOptions.variables,
            querySelectionSet: queryDefinition.selectionSet,
            queryFragments: fragments,
        };
    };
    QueryManager.prototype.transformResult = function (result) {
        if (!this.resultTransformer) {
            return result;
        }
        else {
            return this.resultTransformer(result);
        }
    };
    QueryManager.prototype.collectResultBehaviorsFromUpdateQueries = function (updateQueries, mutationResult, isOptimistic) {
        var _this = this;
        if (isOptimistic === void 0) { isOptimistic = false; }
        if (!updateQueries) {
            return [];
        }
        var resultBehaviors = [];
        Object.keys(updateQueries).forEach(function (queryName) {
            var reducer = updateQueries[queryName];
            var queryIds = _this.queryIdsByName[queryName];
            if (!queryIds) {
                return;
            }
            queryIds.forEach(function (queryId) {
                var _a = _this.getQueryWithPreviousResult(queryId, isOptimistic), previousResult = _a.previousResult, queryVariables = _a.queryVariables, querySelectionSet = _a.querySelectionSet, queryFragments = _a.queryFragments;
                var newResult = errorHandling_1.tryFunctionOrLogError(function () { return reducer(previousResult, {
                    mutationResult: mutationResult,
                    queryName: queryName,
                    queryVariables: queryVariables,
                }); });
                if (newResult) {
                    resultBehaviors.push({
                        type: 'QUERY_RESULT',
                        newResult: newResult,
                        queryVariables: queryVariables,
                        querySelectionSet: querySelectionSet,
                        queryFragments: queryFragments,
                    });
                }
            });
        });
        return resultBehaviors;
    };
    QueryManager.prototype.transformQueryDocument = function (options) {
        var query = options.query, _a = options.fragments, fragments = _a === void 0 ? [] : _a;
        var queryDoc = getFromAST_1.addFragmentsToDocument(query, fragments);
        if (this.queryTransformer) {
            queryDoc = queryTransform_1.applyTransformers(queryDoc, [this.queryTransformer]);
        }
        return {
            queryDoc: queryDoc,
            fragmentMap: getFromAST_1.createFragmentMap(getFromAST_1.getFragmentDefinitions(queryDoc)),
        };
    };
    QueryManager.prototype.handleDiffQuery = function (_a) {
        var queryDef = _a.queryDef, rootId = _a.rootId, variables = _a.variables, fragmentMap = _a.fragmentMap, noFetch = _a.noFetch;
        var _b = diffAgainstStore_1.diffSelectionSetAgainstStore({
            selectionSet: queryDef.selectionSet,
            context: {
                store: this.store.getState()[this.reduxRootKey].data,
                fragmentMap: fragmentMap,
                fetchMiddleware: this.storeFetchMiddleware,
            },
            throwOnMissingField: false,
            rootId: rootId,
            variables: variables,
        }), missingSelectionSets = _b.missingSelectionSets, result = _b.result;
        var initialResult = result;
        var diffedQuery;
        if (missingSelectionSets && missingSelectionSets.length && !noFetch) {
            diffedQuery = queryPrinting_1.queryDocument({
                missingSelectionSets: missingSelectionSets,
                variableDefinitions: queryDef.variableDefinitions,
                name: queryDef.name,
                fragmentMap: fragmentMap,
            });
        }
        return {
            diffedQuery: diffedQuery,
            initialResult: initialResult,
        };
    };
    QueryManager.prototype.fetchRequest = function (_a) {
        var _this = this;
        var requestId = _a.requestId, queryId = _a.queryId, query = _a.query, querySS = _a.querySS, options = _a.options, fragmentMap = _a.fragmentMap, networkInterface = _a.networkInterface;
        var variables = options.variables, noFetch = options.noFetch, returnPartialData = options.returnPartialData;
        var request = {
            query: query,
            variables: variables,
            operationName: getFromAST_1.getOperationName(query),
        };
        var fetchRequest = {
            options: { query: query, variables: variables },
            queryId: queryId,
            operationName: request.operationName,
        };
        var retPromise = new Promise(function (resolve, reject) {
            _this.addFetchQueryPromise(requestId, retPromise, resolve, reject);
            return _this.batcher.enqueueRequest(fetchRequest)
                .then(function (result) {
                _this.store.dispatch({
                    type: 'APOLLO_QUERY_RESULT',
                    result: result,
                    queryId: queryId,
                    requestId: requestId,
                });
                _this.removeFetchQueryPromise(requestId);
                return result;
            }).then(function () {
                var resultFromStore;
                try {
                    resultFromStore = readFromStore_1.readSelectionSetFromStore({
                        context: {
                            store: _this.getApolloState().data,
                            fragmentMap: fragmentMap,
                        },
                        rootId: querySS.id,
                        selectionSet: querySS.selectionSet,
                        variables: variables,
                        returnPartialData: returnPartialData || noFetch,
                    });
                }
                catch (e) { }
                _this.removeFetchQueryPromise(requestId);
                resolve({ data: resultFromStore, loading: false });
            }).catch(function (error) {
                _this.store.dispatch({
                    type: 'APOLLO_QUERY_ERROR',
                    error: error,
                    queryId: queryId,
                    requestId: requestId,
                });
                _this.removeFetchQueryPromise(requestId);
            });
        });
        return retPromise;
    };
    QueryManager.prototype.fetchQueryOverInterface = function (queryId, options, networkInterface) {
        var variables = options.variables, _a = options.forceFetch, forceFetch = _a === void 0 ? false : _a, _b = options.returnPartialData, returnPartialData = _b === void 0 ? false : _b, _c = options.noFetch, noFetch = _c === void 0 ? false : _c;
        var _d = this.transformQueryDocument(options), queryDoc = _d.queryDoc, fragmentMap = _d.fragmentMap;
        var queryDef = getFromAST_1.getQueryDefinition(queryDoc);
        var queryString = printer_1.print(queryDoc);
        var querySS = {
            id: 'ROOT_QUERY',
            typeName: 'Query',
            selectionSet: queryDef.selectionSet,
        };
        var minimizedQueryString = queryString;
        var minimizedQuery = querySS;
        var minimizedQueryDoc = queryDoc;
        var storeResult;
        if (!forceFetch) {
            var _e = this.handleDiffQuery({
                queryDef: queryDef,
                rootId: querySS.id,
                variables: variables,
                fragmentMap: fragmentMap,
                noFetch: noFetch,
            }), diffedQuery = _e.diffedQuery, initialResult = _e.initialResult;
            storeResult = initialResult;
            if (diffedQuery) {
                minimizedQueryDoc = diffedQuery;
                minimizedQueryString = printer_1.print(minimizedQueryDoc);
                minimizedQuery = {
                    id: querySS.id,
                    typeName: 'Query',
                    selectionSet: getFromAST_1.getQueryDefinition(diffedQuery).selectionSet,
                };
            }
            else {
                minimizedQueryDoc = null;
                minimizedQueryString = null;
                minimizedQuery = null;
            }
        }
        var requestId = this.generateRequestId();
        this.store.dispatch({
            type: 'APOLLO_QUERY_INIT',
            queryString: queryString,
            query: querySS,
            minimizedQueryString: minimizedQueryString,
            minimizedQuery: minimizedQuery,
            variables: variables,
            forceFetch: forceFetch,
            returnPartialData: returnPartialData || noFetch,
            queryId: queryId,
            requestId: requestId,
            fragmentMap: fragmentMap,
        });
        if (!minimizedQuery || returnPartialData || noFetch) {
            this.store.dispatch({
                type: 'APOLLO_QUERY_RESULT_CLIENT',
                result: { data: storeResult },
                variables: variables,
                query: querySS,
                complete: !!minimizedQuery,
                queryId: queryId,
            });
        }
        if (minimizedQuery && !noFetch) {
            return this.fetchRequest({
                requestId: requestId,
                queryId: queryId,
                query: minimizedQueryDoc,
                querySS: minimizedQuery,
                options: options,
                fragmentMap: fragmentMap,
                networkInterface: networkInterface,
            });
        }
        return Promise.resolve({ data: storeResult });
    };
    QueryManager.prototype.refetchQueryByName = function (queryName) {
        var _this = this;
        this.queryIdsByName[queryName].forEach(function (queryId) {
            _this.observableQueries[queryId].observableQuery.refetch();
        });
    };
    QueryManager.prototype.isDifferentResult = function (queryId, result) {
        var comparator = this.resultComparator || isEqual;
        return !comparator(this.queryResults[queryId], result);
    };
    QueryManager.prototype.broadcastQueries = function () {
        var queries = this.getApolloState().queries;
        forOwn(this.queryListeners, function (listener, queryId) {
            if (listener) {
                var queryStoreValue = queries[queryId];
                listener(queryStoreValue);
            }
        });
    };
    QueryManager.prototype.generateRequestId = function () {
        var requestId = this.idCounter;
        this.idCounter++;
        return requestId;
    };
    return QueryManager;
}());
exports.QueryManager = QueryManager;
//# sourceMappingURL=QueryManager.js.map