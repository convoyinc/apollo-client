var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { createNetworkInterface, } from './transport/networkInterface';
import { execute, ApolloLink } from 'apollo-link-core';
import { HeuristicFragmentMatcher, } from './data/fragmentMatcher';
import { QueryManager } from './core/QueryManager';
import { isProduction } from './util/environment';
import { getStoreKeyName } from './data/storeUtils';
import { version } from './version';
import { InMemoryCache } from './data/inMemoryCache';
function defaultDataIdFromObject(result) {
    if (result.__typename) {
        if (result.id !== undefined) {
            return result.__typename + ":" + result.id;
        }
        if (result._id !== undefined) {
            return result.__typename + ":" + result._id;
        }
    }
    return null;
}
var hasSuggestedDevtools = false;
var ApolloClient = (function () {
    function ApolloClient(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        var dataIdFromObject = options.dataIdFromObject;
        var networkInterface = options.networkInterface, initialState = options.initialState, initialCache = options.initialCache, _a = options.ssrMode, ssrMode = _a === void 0 ? false : _a, _b = options.ssrForceFetchDelay, ssrForceFetchDelay = _b === void 0 ? 0 : _b, _c = options.addTypename, addTypename = _c === void 0 ? true : _c, customResolvers = options.customResolvers, connectToDevTools = options.connectToDevTools, fragmentMatcher = options.fragmentMatcher, _d = options.queryDeduplication, queryDeduplication = _d === void 0 ? true : _d;
        if (typeof fragmentMatcher === 'undefined') {
            this.fragmentMatcher = new HeuristicFragmentMatcher();
        }
        else {
            this.fragmentMatcher = fragmentMatcher;
        }
        var createQuery = function (getResult) {
            var resolved = false;
            return function (request) {
                return new Promise(function (resolve, reject) {
                    var subscription = getResult(request).subscribe({
                        next: function (data) {
                            if (!resolved) {
                                resolve(data);
                                resolved = true;
                            }
                            else {
                                console.warn('Apollo Client does not support multiple results from an Observable');
                            }
                        },
                        error: reject,
                        complete: function () { return subscription.unsubscribe(); },
                    });
                });
            };
        };
        if (networkInterface instanceof ApolloLink) {
            this.networkInterface = {
                query: createQuery(function (request) {
                    return execute(networkInterface, request);
                }),
            };
        }
        else if (networkInterface &&
            typeof networkInterface.request ===
                'function') {
            console.warn("The Observable Network interface will be deprecated");
            this.networkInterface = __assign({}, networkInterface, { query: createQuery(networkInterface.request) });
        }
        else {
            this.networkInterface = networkInterface
                ? networkInterface
                : createNetworkInterface({ uri: '/graphql' });
        }
        this.initialState = initialState ? initialState : {};
        this.addTypename = addTypename;
        this.disableNetworkFetches = ssrMode || ssrForceFetchDelay > 0;
        this.dataId = dataIdFromObject =
            dataIdFromObject || defaultDataIdFromObject;
        this.dataIdFromObject = this.dataId;
        this.fieldWithArgs = getStoreKeyName;
        this.queryDeduplication = queryDeduplication;
        this.ssrMode = ssrMode;
        if (ssrForceFetchDelay) {
            setTimeout(function () { return (_this.disableNetworkFetches = false); }, ssrForceFetchDelay);
        }
        this.reducerConfig = {
            dataIdFromObject: dataIdFromObject,
            customResolvers: customResolvers,
            addTypename: addTypename,
            fragmentMatcher: this.fragmentMatcher.match,
        };
        this.initialCache = initialCache
            ? initialCache
            : new InMemoryCache(this.reducerConfig, this.initialState && this.initialState.data
                ? this.initialState.data
                : {});
        this.watchQuery = this.watchQuery.bind(this);
        this.query = this.query.bind(this);
        this.mutate = this.mutate.bind(this);
        this.resetStore = this.resetStore.bind(this);
        var defaultConnectToDevTools = !isProduction() &&
            typeof window !== 'undefined' &&
            !window.__APOLLO_CLIENT__;
        if (typeof connectToDevTools === 'undefined'
            ? defaultConnectToDevTools
            : connectToDevTools) {
            window.__APOLLO_CLIENT__ = this;
        }
        if (!hasSuggestedDevtools && !isProduction()) {
            hasSuggestedDevtools = true;
            if (typeof window !== 'undefined' &&
                window.document &&
                window.top === window.self) {
                if (typeof window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
                    if (navigator.userAgent.indexOf('Chrome') > -1) {
                        console.debug('Download the Apollo DevTools ' +
                            'for a better development experience: ' +
                            'https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm');
                    }
                }
            }
        }
        this.version = version;
    }
    ApolloClient.prototype.watchQuery = function (options) {
        this.initQueryManager();
        if (this.disableNetworkFetches && options.fetchPolicy === 'network-only') {
            options = __assign({}, options, { fetchPolicy: 'cache-first' });
        }
        return this.queryManager.watchQuery(options);
    };
    ApolloClient.prototype.query = function (options) {
        this.initQueryManager();
        if (options.fetchPolicy === 'cache-and-network') {
            throw new Error('cache-and-network fetchPolicy can only be used with watchQuery');
        }
        if (this.disableNetworkFetches && options.fetchPolicy === 'network-only') {
            options = __assign({}, options, { fetchPolicy: 'cache-first' });
        }
        return this.queryManager.query(options);
    };
    ApolloClient.prototype.mutate = function (options) {
        this.initQueryManager();
        return this.queryManager.mutate(options);
    };
    ApolloClient.prototype.subscribe = function (options) {
        this.initQueryManager();
        return this.queryManager.startGraphQLSubscription(options);
    };
    ApolloClient.prototype.readQuery = function (options) {
        return this.initProxy().readQuery(options);
    };
    ApolloClient.prototype.readFragment = function (options) {
        return this.initProxy().readFragment(options);
    };
    ApolloClient.prototype.writeQuery = function (options) {
        return this.initProxy().writeQuery(options);
    };
    ApolloClient.prototype.writeFragment = function (options) {
        return this.initProxy().writeFragment(options);
    };
    ApolloClient.prototype.__actionHookForDevTools = function (cb) {
        this.devToolsHookCb = cb;
    };
    ApolloClient.prototype.initQueryManager = function () {
        var _this = this;
        if (this.queryManager) {
            return;
        }
        this.queryManager = new QueryManager({
            networkInterface: this.networkInterface,
            addTypename: this.addTypename,
            reducerConfig: this.reducerConfig,
            queryDeduplication: this.queryDeduplication,
            fragmentMatcher: this.fragmentMatcher,
            ssrMode: this.ssrMode,
            initialCache: this.initialCache,
            onBroadcast: function () {
                if (_this.devToolsHookCb) {
                    _this.devToolsHookCb({
                        action: {},
                        state: {
                            queries: _this.queryManager.queryStore.getStore(),
                            mutations: _this.queryManager.mutationStore.getStore(),
                        },
                        dataWithOptimisticResults: _this.queryManager.dataStore.getCache().getOptimisticData(),
                    });
                }
            },
        });
    };
    ApolloClient.prototype.resetStore = function () {
        return this.queryManager ? this.queryManager.resetStore() : null;
    };
    ApolloClient.prototype.initProxy = function () {
        if (!this.proxy) {
            this.initQueryManager();
            this.proxy = this.queryManager.dataStore.getCache();
        }
        return this.proxy;
    };
    return ApolloClient;
}());
export default ApolloClient;
//# sourceMappingURL=ApolloClient.js.map