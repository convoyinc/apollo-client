"use strict";
var chai = require('chai');
var assert = chai.assert;
var store_1 = require('../src/store');
describe('createApolloStore', function () {
    it('does not require any arguments', function () {
        var store = store_1.createApolloStore();
        assert.isDefined(store);
    });
    it('has a default root key', function () {
        var store = store_1.createApolloStore();
        assert.deepEqual(store.getState()['apollo'], {
            queries: {},
            mutations: {},
            data: {},
            optimistic: [],
        });
    });
    it('can take a custom root key', function () {
        var store = store_1.createApolloStore({
            reduxRootKey: 'test',
        });
        assert.deepEqual(store.getState()['test'], {
            queries: {},
            mutations: {},
            data: {},
            optimistic: [],
        });
    });
    it('can be rehydrated from the server', function () {
        var initialState = {
            apollo: {
                queries: {
                    'test.0': true,
                },
                mutations: {},
                data: {
                    'test.0': true,
                },
                optimistic: [],
            },
        };
        var store = store_1.createApolloStore({
            initialState: initialState,
        });
        assert.deepEqual(store.getState(), initialState);
    });
    it('reset itself', function () {
        var initialState = {
            apollo: {
                queries: {
                    'test.0': true,
                },
                mutations: {},
                data: {
                    'test.0': true,
                },
            },
        };
        var emptyState = {
            queries: {},
            mutations: {},
            data: {},
            optimistic: [],
        };
        var store = store_1.createApolloStore({
            initialState: initialState,
        });
        store.dispatch({
            type: 'APOLLO_STORE_RESET',
            observableQueryIds: [],
        });
        assert.deepEqual(store.getState().apollo, emptyState);
    });
    it('can reset itself and keep the observable query ids', function () {
        var initialState = {
            apollo: {
                queries: {
                    'test.0': true,
                    'test.1': false,
                },
                mutations: {},
                data: {
                    'test.0': true,
                    'test.1': true,
                },
                optimistic: [],
            },
        };
        var emptyState = {
            queries: {
                'test.0': true,
            },
            mutations: {},
            data: {},
            optimistic: [],
        };
        var store = store_1.createApolloStore({
            initialState: initialState,
        });
        store.dispatch({
            type: 'APOLLO_STORE_RESET',
            observableQueryIds: ['test.0'],
        });
        assert.deepEqual(store.getState().apollo, emptyState);
    });
});
//# sourceMappingURL=store.js.map