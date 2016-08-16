"use strict";
var chai = require('chai');
var assert = chai.assert;
var mockNetworkInterface_1 = require('./mocks/mockNetworkInterface');
var src_1 = require('../src');
var assign = require('lodash.assign');
var clonedeep = require('lodash.clonedeep');
var graphql_tag_1 = require('graphql-tag');
describe('updateQuery on a simple query', function () {
    var query = (_a = ["\n    query thing {\n      entry {\n        value\n      }\n    }\n  "], _a.raw = ["\n    query thing {\n      entry {\n        value\n      }\n    }\n  "], graphql_tag_1.default(_a));
    var result = {
        data: {
            entry: {
                value: 1,
            },
        },
    };
    it('triggers new result from updateQuery', function () {
        var latestResult = null;
        var networkInterface = mockNetworkInterface_1.default({
            request: { query: query },
            result: result,
        });
        var client = new src_1.default({
            networkInterface: networkInterface,
        });
        var obsHandle = client.watchQuery({
            query: query,
        });
        var sub = obsHandle.subscribe({
            next: function (queryResult) {
                latestResult = queryResult;
            },
        });
        return new Promise(function (resolve) { return setTimeout(resolve); })
            .then(function () { return obsHandle; })
            .then(function (watchedQuery) {
            assert.equal(latestResult.data.entry.value, 1);
            watchedQuery.updateQuery(function (prevResult) {
                var res = clonedeep(prevResult);
                res.entry.value = 2;
                return res;
            });
            assert.equal(latestResult.data.entry.value, 2);
        })
            .then(function () { return sub.unsubscribe(); });
    });
    var _a;
});
describe('fetchMore on an observable query', function () {
    var query = (_a = ["\n    query Comment($repoName: String!, $start: Int!, $limit: Int!) {\n      entry(repoFullName: $repoName) {\n        comments(start: $start, limit: $limit) {\n          text\n        }\n      }\n    }\n  "], _a.raw = ["\n    query Comment($repoName: String!, $start: Int!, $limit: Int!) {\n      entry(repoFullName: $repoName) {\n        comments(start: $start, limit: $limit) {\n          text\n        }\n      }\n    }\n  "], graphql_tag_1.default(_a));
    var query2 = (_b = ["\n    query NewComments($start: Int!, $limit: Int!) {\n      comments(start: $start, limit: $limit) {\n        text\n      }\n    }\n  "], _b.raw = ["\n    query NewComments($start: Int!, $limit: Int!) {\n      comments(start: $start, limit: $limit) {\n        text\n      }\n    }\n  "], graphql_tag_1.default(_b));
    var variables = {
        repoName: 'org/repo',
        start: 0,
        limit: 10,
    };
    var variablesMore = assign({}, variables, { start: 10, limit: 10 });
    var variables2 = {
        start: 10,
        limit: 20,
    };
    var result = {
        data: {
            entry: {
                comments: [],
            },
        },
    };
    var resultMore = clonedeep(result);
    var result2 = {
        data: {
            comments: [],
        },
    };
    for (var i = 1; i <= 10; i++) {
        result.data.entry.comments.push({ text: "comment " + i });
    }
    for (var i = 11; i <= 20; i++) {
        resultMore.data.entry.comments.push({ text: "comment " + i });
        result2.data.comments.push({ text: "new comment " + i });
    }
    var latestResult = null;
    var client;
    var networkInterface;
    var sub;
    function setup() {
        var mockedResponses = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            mockedResponses[_i - 0] = arguments[_i];
        }
        networkInterface = mockNetworkInterface_1.default.apply(void 0, [{
            request: {
                query: query,
                variables: variables,
            },
            result: result,
        }].concat(mockedResponses));
        client = new src_1.default({
            networkInterface: networkInterface,
        });
        var obsHandle = client.watchQuery({
            query: query,
            variables: variables,
        });
        sub = obsHandle.subscribe({
            next: function (queryResult) {
                latestResult = queryResult;
            },
        });
        return Promise.resolve(obsHandle);
    }
    ;
    function unsetup() {
        sub.unsubscribe();
        sub = null;
    }
    it('basic fetchMore results merging', function () {
        latestResult = null;
        return setup({
            request: {
                query: query,
                variables: variablesMore,
            },
            result: resultMore,
        }).then(function (watchedQuery) {
            return watchedQuery.fetchMore({
                variables: { start: 10 },
                updateQuery: function (prev, options) {
                    var state = clonedeep(prev);
                    state.entry.comments = state.entry.comments.concat(options.fetchMoreResult.data.entry.comments);
                    return state;
                },
            });
        }).then(function () {
            var comments = latestResult.data.entry.comments;
            assert.lengthOf(comments, 20);
            for (var i = 1; i <= 20; i++) {
                assert.equal(comments[i - 1].text, "comment " + i);
            }
            unsetup();
        });
    });
    it('fetching more with a different query', function () {
        latestResult = null;
        return setup({
            request: {
                query: query2,
                variables: variables2,
            },
            result: result2,
        }).then(function (watchedQuery) {
            return watchedQuery.fetchMore({
                query: query2,
                variables: variables2,
                updateQuery: function (prev, options) {
                    var state = clonedeep(prev);
                    state.entry.comments = state.entry.comments.concat(options.fetchMoreResult.data.comments);
                    return state;
                },
            });
        }).then(function () {
            var comments = latestResult.data.entry.comments;
            assert.lengthOf(comments, 20);
            for (var i = 1; i <= 10; i++) {
                assert.equal(comments[i - 1].text, "comment " + i);
            }
            for (var i = 11; i <= 20; i++) {
                assert.equal(comments[i - 1].text, "new comment " + i);
            }
            unsetup();
        });
    });
    var _a, _b;
});
//# sourceMappingURL=fetchMore.js.map