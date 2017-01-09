"use strict";
var chai_1 = require("chai");
var ApolloError_1 = require("../src/errors/ApolloError");
describe('ApolloError', function () {
    it('should construct itself correctly', function () {
        var graphQLErrors = [
            new Error('Something went wrong with GraphQL'),
            new Error('Something else went wrong with GraphQL'),
        ];
        var networkError = new Error('Network error');
        var errorMessage = 'this is an error message';
        var apolloError = new ApolloError_1.ApolloError({
            graphQLErrors: graphQLErrors,
            networkError: networkError,
            errorMessage: errorMessage,
        });
        chai_1.assert.equal(apolloError.graphQLErrors, graphQLErrors);
        chai_1.assert.equal(apolloError.networkError, networkError);
        chai_1.assert.equal(apolloError.message, errorMessage);
    });
    it('should add a network error to the message', function () {
        var networkError = new Error('this is an error message');
        var apolloError = new ApolloError_1.ApolloError({
            networkError: networkError,
        });
        chai_1.assert.include(apolloError.message, 'Network error: ');
        chai_1.assert.include(apolloError.message, 'this is an error message');
        chai_1.assert.equal(apolloError.message.split('\n').length, 1);
    });
    it('should add a graphql error to the message', function () {
        var graphQLErrors = [new Error('this is an error message')];
        var apolloError = new ApolloError_1.ApolloError({
            graphQLErrors: graphQLErrors,
        });
        chai_1.assert.include(apolloError.message, 'GraphQL error: ');
        chai_1.assert.include(apolloError.message, 'this is an error message');
        chai_1.assert.equal(apolloError.message.split('\n').length, 1);
    });
    it('should add multiple graphql errors to the message', function () {
        var graphQLErrors = [new Error('this is new'),
            new Error('this is old'),
        ];
        var apolloError = new ApolloError_1.ApolloError({
            graphQLErrors: graphQLErrors,
        });
        var messages = apolloError.message.split('\n');
        chai_1.assert.equal(messages.length, 2);
        chai_1.assert.include(messages[0], 'GraphQL error');
        chai_1.assert.include(messages[0], 'this is new');
        chai_1.assert.include(messages[1], 'GraphQL error');
        chai_1.assert.include(messages[1], 'this is old');
    });
    it('should add both network and graphql errors to the message', function () {
        var graphQLErrors = [new Error('graphql error message')];
        var networkError = new Error('network error message');
        var apolloError = new ApolloError_1.ApolloError({
            graphQLErrors: graphQLErrors,
            networkError: networkError,
        });
        var messages = apolloError.message.split('\n');
        chai_1.assert.equal(messages.length, 2);
        chai_1.assert.include(messages[0], 'GraphQL error');
        chai_1.assert.include(messages[0], 'graphql error message');
        chai_1.assert.include(messages[1], 'Network error');
        chai_1.assert.include(messages[1], 'network error message');
    });
    it('should contain a stack trace', function () {
        var graphQLErrors = [new Error('graphql error message')];
        var networkError = new Error('network error message');
        var apolloError = new ApolloError_1.ApolloError({
            graphQLErrors: graphQLErrors,
            networkError: networkError,
        });
        chai_1.assert(apolloError.stack, 'Does not contain a stack trace.');
    });
});
//# sourceMappingURL=errors.js.map