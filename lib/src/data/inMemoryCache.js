var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { Cache } from './cache';
import { writeResultToStore } from './writeToStore';
import { readQueryFromStore, diffQueryAgainstStore, } from './readFromStore';
var InMemoryCache = (function (_super) {
    __extends(InMemoryCache, _super);
    function InMemoryCache(config, initialStore) {
        if (initialStore === void 0) { initialStore = {}; }
        var _this = _super.call(this, config.addTypename || false) || this;
        _this.optimistic = [];
        _this.watches = [];
        _this.config = config;
        _this.data = initialStore;
        return _this;
    }
    InMemoryCache.prototype.getData = function () {
        return this.data;
    };
    InMemoryCache.prototype.getOptimisticData = function () {
        if (this.optimistic.length === 0) {
            return this.data;
        }
        var patches = this.optimistic.map(function (opt) { return opt.data; });
        return Object.assign.apply(Object, [{}, this.data].concat(patches));
    };
    InMemoryCache.prototype.reset = function () {
        this.data = {};
        this.broadcastWatches();
        return Promise.resolve();
    };
    InMemoryCache.prototype.applyTransformer = function (transform) {
        this.data = transform(this.data);
        this.broadcastWatches();
    };
    InMemoryCache.prototype.diffQuery = function (query) {
        return diffQueryAgainstStore({
            store: query.optimistic ? this.getOptimisticData() : this.data,
            query: query.query,
            variables: query.variables,
            returnPartialData: query.returnPartialData,
            previousResult: query.previousResult,
            fragmentMatcherFunction: this.config.fragmentMatcher,
            config: this.config,
        });
    };
    InMemoryCache.prototype.read = function (query) {
        if (query.rootId && typeof this.data[query.rootId] === 'undefined') {
            return null;
        }
        return readQueryFromStore({
            store: query.optimistic ? this.getOptimisticData() : this.data,
            query: query.query,
            variables: query.variables,
            rootId: query.rootId,
            fragmentMatcherFunction: this.config.fragmentMatcher,
            previousResult: query.previousResult,
            config: this.config,
        });
    };
    InMemoryCache.prototype.writeResult = function (write) {
        writeResultToStore(__assign({}, write, { store: this.data, dataIdFromObject: this.config.dataIdFromObject, fragmentMatcherFunction: this.config.fragmentMatcher }));
        this.broadcastWatches();
    };
    InMemoryCache.prototype.removeOptimistic = function (id) {
        var _this = this;
        var toPerform = this.optimistic.filter(function (item) { return item.id !== id; });
        this.optimistic = [];
        toPerform.forEach(function (change) {
            _this.recordOptimisticTransaction(change.transaction, change.id);
        });
    };
    InMemoryCache.prototype.performTransaction = function (transaction) {
        transaction(this);
    };
    InMemoryCache.prototype.recordOptimisticTransaction = function (transaction, id) {
        var before = this.getOptimisticData();
        var orig = this.data;
        this.data = __assign({}, before);
        transaction(this);
        var after = this.data;
        this.data = orig;
        var patch = {};
        Object.keys(after).forEach(function (key) {
            if (after[key] !== before[key]) {
                patch[key] = after[key];
            }
        });
        this.optimistic.push({
            id: id,
            transaction: transaction,
            data: patch,
        });
        this.broadcastWatches();
    };
    InMemoryCache.prototype.watch = function (query, callback) {
        var _this = this;
        this.watches.push(callback);
        return function () {
            _this.watches = _this.watches.filter(function (c) { return c !== callback; });
        };
    };
    InMemoryCache.prototype.broadcastWatches = function () {
        this.watches.forEach(function (c) { return c(); });
    };
    return InMemoryCache;
}(Cache));
export { InMemoryCache };
//# sourceMappingURL=inMemoryCache.js.map