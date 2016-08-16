"use strict";
var queryMerging_1 = require('../src/batching/queryMerging');
var getFromAST_1 = require('../src/queries/getFromAST');
var printer_1 = require('graphql-tag/printer');
var graphql_tag_1 = require('graphql-tag');
var chai_1 = require('chai');
var cloneDeep = require('lodash.clonedeep');
describe('Query merging', function () {
    it('should be able to add a prefix to a variables object', function () {
        var variables = {
            'offset': 15,
            'not_offset': 'lol',
        };
        var expResult = {
            '___feed:offset': 15,
            '___feed:not_offset': 'lol',
        };
        var result = queryMerging_1.addPrefixToVariables('___feed:', variables);
        chai_1.assert.deepEqual(result, expResult);
    });
    it('should be able to add a prefix to the query name', function () {
        var query = (_a = ["\n      query author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      query author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_a));
        var expQuery = (_b = ["\n      query ___composed___author {\n        firstName\n        lastName\n      }"], _b.raw = ["\n      query ___composed___author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_b));
        var queryDef = getFromAST_1.getQueryDefinition(query);
        var expQueryDefinition = getFromAST_1.getQueryDefinition(expQuery);
        var resultQueryDefinition = queryMerging_1.addPrefixToQuery('___composed___', queryDef);
        chai_1.assert.deepEqual(printer_1.print(resultQueryDefinition), printer_1.print(expQueryDefinition));
        var _a, _b;
    });
    it('should be able to alias a field', function () {
        var query = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var expQuery = (_b = ["\n      query {\n        listOfAuthors: author {\n          firstName\n          lastName\n        }\n      }"], _b.raw = ["\n      query {\n        listOfAuthors: author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_b));
        var queryDef = getFromAST_1.getQueryDefinition(query);
        var expQueryDefinition = getFromAST_1.getQueryDefinition(expQuery);
        var queryField = queryDef.selectionSet.selections[0];
        var expField = expQueryDefinition.selectionSet.selections[0];
        var queryFieldCopy = cloneDeep(queryField);
        var resField = queryMerging_1.aliasField(queryFieldCopy, 'listOfAuthors');
        chai_1.assert.deepEqual(printer_1.print(resField), printer_1.print(expField));
        var _a, _b;
    });
    it('should be able to create a query alias name', function () {
        var query = (_a = ["\n      query listOfAuthors {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query listOfAuthors {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var expAliasName = '___listOfAuthors___requestIndex_3';
        var resAliasName = queryMerging_1.getOperationDefinitionName(getFromAST_1.getQueryDefinition(query), 3);
        chai_1.assert.equal(resAliasName, expAliasName);
        var _a;
    });
    it('should apply the alias name to all top level fields', function () {
        var query = (_a = ["\n      query listOfAuthors {\n        author {\n          firstName\n          lastName\n        }\n        __typename\n      }"], _a.raw = ["\n      query listOfAuthors {\n        author {\n          firstName\n          lastName\n        }\n        __typename\n      }"], graphql_tag_1.default(_a));
        var expQuery = (_b = ["\n      query listOfAuthors {\n        ___listOfAuthors___requestIndex_3___fieldIndex_0: author {\n          firstName\n          lastName\n        }\n        ___listOfAuthors___requestIndex_3___fieldIndex_1: __typename\n      }"], _b.raw = ["\n      query listOfAuthors {\n        ___listOfAuthors___requestIndex_3___fieldIndex_0: author {\n          firstName\n          lastName\n        }\n        ___listOfAuthors___requestIndex_3___fieldIndex_1: __typename\n      }"], graphql_tag_1.default(_b));
        var queryDef = getFromAST_1.getQueryDefinition(query);
        var expQueryDef = getFromAST_1.getQueryDefinition(expQuery);
        var aliasName = queryMerging_1.getOperationDefinitionName(queryDef, 3);
        var aliasedQuery = queryMerging_1.applyAliasNameToTopLevelFields(queryDef, aliasName, 0);
        chai_1.assert.equal(printer_1.print(aliasedQuery), printer_1.print(expQueryDef));
        var _a, _b;
    });
    it('should be able to add a query to a root query with aliased fields', function () {
        var childQuery = (_a = ["\n    query listOfAuthors {\n      author {\n        firstName\n        lastName\n      }\n      __typename\n    }"], _a.raw = ["\n    query listOfAuthors {\n      author {\n        firstName\n        lastName\n      }\n      __typename\n    }"], graphql_tag_1.default(_a));
        var rootQuery = (_b = ["\n      query ___composed {\n        author\n      }"], _b.raw = ["\n      query ___composed {\n        author\n      }"], graphql_tag_1.default(_b));
        rootQuery.definitions[0].selectionSet.selections = [];
        var expRootQuery = (_c = ["\n      query ___composed {\n        ___listOfAuthors___requestIndex_3___fieldIndex_0: author {\n          firstName\n          lastName\n        }\n        ___listOfAuthors___requestIndex_3___fieldIndex_1: __typename\n      }"], _c.raw = ["\n      query ___composed {\n        ___listOfAuthors___requestIndex_3___fieldIndex_0: author {\n          firstName\n          lastName\n        }\n        ___listOfAuthors___requestIndex_3___fieldIndex_1: __typename\n      }"], graphql_tag_1.default(_c));
        var modifiedRootQuery = queryMerging_1.addQueryToRoot(rootQuery, childQuery, 3);
        chai_1.assert.equal(printer_1.print(modifiedRootQuery), printer_1.print(expRootQuery));
        var _a, _b, _c;
    });
    it('should be able to alias named fragments', function () {
        var query = (_a = ["\n      query authorStuff {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      query authorStuff {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_a));
        var queryDef = getFromAST_1.getQueryDefinition(query);
        var fragmentDefinition = getFromAST_1.getFragmentDefinitions(query)[0];
        var aliasName = queryMerging_1.getOperationDefinitionName(queryDef, 2);
        var exp = getFromAST_1.getFragmentDefinitions((_b = ["\n      fragment ___authorStuff___requestIndex_2___authorDetails on Author {\n        ___authorStuff___requestIndex_2___fieldIndex_0: firstName\n        ___authorStuff___requestIndex_2___fieldIndex_1: lastName\n      }"], _b.raw = ["\n      fragment ___authorStuff___requestIndex_2___authorDetails on Author {\n        ___authorStuff___requestIndex_2___fieldIndex_0: firstName\n        ___authorStuff___requestIndex_2___fieldIndex_1: lastName\n      }"], graphql_tag_1.default(_b)))[0];
        var res = queryMerging_1.applyAliasNameToFragment(fragmentDefinition, aliasName, 0);
        chai_1.assert.equal(printer_1.print(res), printer_1.print(exp));
        var _a, _b;
    });
    it('should be able to rename fragment spreads to their aliased names', function () {
        var doc = (_a = ["\n      query authorStuff {\n        author {\n          ...authorDetails\n        }\n     }"], _a.raw = ["\n      query authorStuff {\n        author {\n          ...authorDetails\n        }\n     }"], graphql_tag_1.default(_a));
        var exp = (_b = ["\n      query {\n        author {\n          ...___authorStuff___requestIndex_2___authorDetails\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          ...___authorStuff___requestIndex_2___authorDetails\n        }\n      }"], graphql_tag_1.default(_b));
        var queryDef = getFromAST_1.getQueryDefinition(doc);
        var expDef = getFromAST_1.getQueryDefinition(exp);
        var res = queryMerging_1.renameFragmentSpreads(queryDef.selectionSet, '___authorStuff___requestIndex_2');
        chai_1.assert.equal(printer_1.print(res), printer_1.print(expDef.selectionSet));
        var _a, _b;
    });
    it('should be able to alias a document containing a query and a named fragment', function () {
        var doc = (_a = ["\n      query authorStuff {\n        author {\n           ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      query authorStuff {\n        author {\n           ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_a));
        var exp = (_b = ["\n      query authorStuff {\n        ___authorStuff___requestIndex_2___fieldIndex_0: author {\n          ...___authorStuff___requestIndex_2___authorDetails\n        }\n      }\n      fragment ___authorStuff___requestIndex_2___authorDetails on Author {\n        ___authorStuff___requestIndex_2___fieldIndex_1: firstName\n        ___authorStuff___requestIndex_2___fieldIndex_2: lastName\n      }\n      "], _b.raw = ["\n      query authorStuff {\n        ___authorStuff___requestIndex_2___fieldIndex_0: author {\n          ...___authorStuff___requestIndex_2___authorDetails\n        }\n      }\n      fragment ___authorStuff___requestIndex_2___authorDetails on Author {\n        ___authorStuff___requestIndex_2___fieldIndex_1: firstName\n        ___authorStuff___requestIndex_2___fieldIndex_2: lastName\n      }\n      "], graphql_tag_1.default(_b));
        var aliasName = queryMerging_1.getOperationDefinitionName(getFromAST_1.getQueryDefinition(doc), 2);
        var aliasedDoc = queryMerging_1.applyAliasNameToDocument(doc, aliasName);
        chai_1.assert.equal(printer_1.print(aliasedDoc), printer_1.print(exp));
        var _a, _b;
    });
    it('should be able to rename variables to their aliased names', function () {
        var doc = (_a = ["\n      query getUser($id: Int) {\n        user(id: $id) {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query getUser($id: Int) {\n        user(id: $id) {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var exp = (_b = ["\n      query getUser($___getUser___requestIndex_2___id: Int) {\n        ___getUser___requestIndex_2___fieldIndex_0: user(id: $___getUser___requestIndex_2___id) {\n          firstName\n          lastName\n        }\n      }"], _b.raw = ["\n      query getUser($___getUser___requestIndex_2___id: Int) {\n        ___getUser___requestIndex_2___fieldIndex_0: user(id: $___getUser___requestIndex_2___id) {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_b));
        var aliasName = queryMerging_1.getOperationDefinitionName(getFromAST_1.getQueryDefinition(doc), 2);
        var aliasedDoc = queryMerging_1.applyAliasNameToDocument(doc, aliasName);
        chai_1.assert.equal(printer_1.print(aliasedDoc), printer_1.print(exp));
        var _a, _b;
    });
    it('should be able to add a query to a root query', function () {
        var doc = (_a = ["\n      query authorStuff {\n        author {\n          firstName\n          lastName\n          ...moreAuthorDetails\n        }\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], _a.raw = ["\n      query authorStuff {\n        author {\n          firstName\n          lastName\n          ...moreAuthorDetails\n        }\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], graphql_tag_1.default(_a));
        var exp = (_b = ["\n      query ___composed {\n        ___authorStuff___requestIndex_0___fieldIndex_0: author {\n          firstName\n          lastName\n          ...___authorStuff___requestIndex_0___moreAuthorDetails\n        }\n      }\n      fragment ___authorStuff___requestIndex_0___moreAuthorDetails on Author {\n        ___authorStuff___requestIndex_0___fieldIndex_1: address\n      } "], _b.raw = ["\n      query ___composed {\n        ___authorStuff___requestIndex_0___fieldIndex_0: author {\n          firstName\n          lastName\n          ...___authorStuff___requestIndex_0___moreAuthorDetails\n        }\n      }\n      fragment ___authorStuff___requestIndex_0___moreAuthorDetails on Author {\n        ___authorStuff___requestIndex_0___fieldIndex_1: address\n      } "], graphql_tag_1.default(_b));
        var mergedQuery = queryMerging_1.mergeQueryDocuments([doc]);
        chai_1.assert.equal(printer_1.print(mergedQuery), printer_1.print(exp));
        var _a, _b;
    });
    it('should stack multiple queries on an empty root query correctly', function () {
        var query1 = (_a = ["\n      query authorInfo {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query authorInfo {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query personAddress {\n        person {\n          address\n        }\n      }"], _b.raw = ["\n      query personAddress {\n        person {\n          address\n        }\n      }"], graphql_tag_1.default(_b));
        var exp = (_c = ["\n      query ___composed {\n        ___authorInfo___requestIndex_0___fieldIndex_0: author {\n          firstName\n          lastName\n        }\n        ___personAddress___requestIndex_1___fieldIndex_0: person {\n          address\n        }\n      }"], _c.raw = ["\n      query ___composed {\n        ___authorInfo___requestIndex_0___fieldIndex_0: author {\n          firstName\n          lastName\n        }\n        ___personAddress___requestIndex_1___fieldIndex_0: person {\n          address\n        }\n      }"], graphql_tag_1.default(_c));
        var queries = [query1, query2];
        var mergedQuery = queryMerging_1.mergeQueryDocuments(queries);
        chai_1.assert.equal(printer_1.print(mergedQuery), printer_1.print(exp));
        var _a, _b, _c;
    });
    it('should be able to merge queries that have fragments with the same name', function () {
        var query1 = (_a = ["\n      query authorInfo {\n        ...authorDetails\n      }\n      fragment authorDetails on Author {\n        author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query authorInfo {\n        ...authorDetails\n      }\n      fragment authorDetails on Author {\n        author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query authors {\n        ...authorDetails\n      }\n      fragment authorDetails on Author {\n        author\n      }"], _b.raw = ["\n      query authors {\n        ...authorDetails\n      }\n      fragment authorDetails on Author {\n        author\n      }"], graphql_tag_1.default(_b));
        var exp = (_c = ["\n      query ___composed {\n        ...___authorInfo___requestIndex_0___authorDetails\n        ...___authors___requestIndex_1___authorDetails\n      }\n      fragment ___authorInfo___requestIndex_0___authorDetails on Author {\n        ___authorInfo___requestIndex_0___fieldIndex_1: author {\n          firstName\n          lastName\n        }\n      }\n      fragment ___authors___requestIndex_1___authorDetails on Author {\n        ___authors___requestIndex_1___fieldIndex_1: author\n      }"], _c.raw = ["\n      query ___composed {\n        ...___authorInfo___requestIndex_0___authorDetails\n        ...___authors___requestIndex_1___authorDetails\n      }\n      fragment ___authorInfo___requestIndex_0___authorDetails on Author {\n        ___authorInfo___requestIndex_0___fieldIndex_1: author {\n          firstName\n          lastName\n        }\n      }\n      fragment ___authors___requestIndex_1___authorDetails on Author {\n        ___authors___requestIndex_1___fieldIndex_1: author\n      }"], graphql_tag_1.default(_c));
        var mergedQuery = queryMerging_1.mergeQueryDocuments([query1, query2]);
        chai_1.assert.equal(printer_1.print(mergedQuery), printer_1.print(exp));
        var _a, _b, _c;
    });
    it('should be able to merge queries with variables correctly', function () {
        var query1 = (_a = ["\n      query authorInfo($id: Int) {\n        author(id: $id)\n      }"], _a.raw = ["\n      query authorInfo($id: Int) {\n        author(id: $id)\n      }"], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query personInfo($id: Int) {\n        person(id: $id)\n      }"], _b.raw = ["\n      query personInfo($id: Int) {\n        person(id: $id)\n      }"], graphql_tag_1.default(_b));
        var exp = (_c = ["\n      query ___composed($___authorInfo___requestIndex_0___id: Int, $___personInfo___requestIndex_1___id: Int) {\n        ___authorInfo___requestIndex_0___fieldIndex_0: author(id: $___authorInfo___requestIndex_0___id)\n        ___personInfo___requestIndex_1___fieldIndex_0: person(id: $___personInfo___requestIndex_1___id)\n      }"], _c.raw = ["\n      query ___composed($___authorInfo___requestIndex_0___id: Int, $___personInfo___requestIndex_1___id: Int) {\n        ___authorInfo___requestIndex_0___fieldIndex_0: author(id: $___authorInfo___requestIndex_0___id)\n        ___personInfo___requestIndex_1___fieldIndex_0: person(id: $___personInfo___requestIndex_1___id)\n      }"], graphql_tag_1.default(_c));
        var mergedQuery = queryMerging_1.mergeQueryDocuments([query1, query2]);
        chai_1.assert.equal(printer_1.print(mergedQuery), printer_1.print(exp));
        var _a, _b, _c;
    });
    it('should be able to merge queries with inline fragments', function () {
        var query1 = (_a = ["\n      query nameOfQuery {\n        ... on RootQuery {\n          user\n        }\n      }"], _a.raw = ["\n      query nameOfQuery {\n        ... on RootQuery {\n          user\n        }\n      }"], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query otherQuery {\n        ... on RootQuery {\n          author\n        }\n      }"], _b.raw = ["\n      query otherQuery {\n        ... on RootQuery {\n          author\n        }\n      }"], graphql_tag_1.default(_b));
        var exp = (_c = ["\n      query ___composed {\n        ... on RootQuery {\n          ___nameOfQuery___requestIndex_0___fieldIndex_0: user\n        }\n        ... on RootQuery {\n          ___otherQuery___requestIndex_1___fieldIndex_0: author\n        }\n      }"], _c.raw = ["\n      query ___composed {\n        ... on RootQuery {\n          ___nameOfQuery___requestIndex_0___fieldIndex_0: user\n        }\n        ... on RootQuery {\n          ___otherQuery___requestIndex_1___fieldIndex_0: author\n        }\n      }"], graphql_tag_1.default(_c));
        var mergedQuery = queryMerging_1.mergeQueryDocuments([query1, query2]);
        chai_1.assert.equal(printer_1.print(mergedQuery), printer_1.print(exp));
        var _a, _b, _c;
    });
    it('should be able to handle multiple fragments when merging queries', function () {
        var query1 = (_a = ["\n      query authorInfo {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      query authorInfo {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query personInfo {\n        person {\n          ...personDetails\n        }\n      }\n      fragment personDetails on Person {\n        name\n      }"], _b.raw = ["\n      query personInfo {\n        person {\n          ...personDetails\n        }\n      }\n      fragment personDetails on Person {\n        name\n      }"], graphql_tag_1.default(_b));
        var exp = (_c = ["\n      query ___composed {\n        ___authorInfo___requestIndex_0___fieldIndex_0: author {\n          ...___authorInfo___requestIndex_0___authorDetails\n        }\n        ___personInfo___requestIndex_1___fieldIndex_0: person {\n          ...___personInfo___requestIndex_1___personDetails\n        }\n      }\n      fragment ___authorInfo___requestIndex_0___authorDetails on Author {\n        ___authorInfo___requestIndex_0___fieldIndex_1: firstName\n        ___authorInfo___requestIndex_0___fieldIndex_2: lastName\n      }\n      fragment ___personInfo___requestIndex_1___personDetails on Person {\n        ___personInfo___requestIndex_1___fieldIndex_1: name\n      }"], _c.raw = ["\n      query ___composed {\n        ___authorInfo___requestIndex_0___fieldIndex_0: author {\n          ...___authorInfo___requestIndex_0___authorDetails\n        }\n        ___personInfo___requestIndex_1___fieldIndex_0: person {\n          ...___personInfo___requestIndex_1___personDetails\n        }\n      }\n      fragment ___authorInfo___requestIndex_0___authorDetails on Author {\n        ___authorInfo___requestIndex_0___fieldIndex_1: firstName\n        ___authorInfo___requestIndex_0___fieldIndex_2: lastName\n      }\n      fragment ___personInfo___requestIndex_1___personDetails on Person {\n        ___personInfo___requestIndex_1___fieldIndex_1: name\n      }"], graphql_tag_1.default(_c));
        var queries = [query1, query2];
        var mergedQuery = queryMerging_1.mergeQueryDocuments(queries);
        chai_1.assert.equal(printer_1.print(mergedQuery), printer_1.print(exp));
        var _a, _b, _c;
    });
    it('should put together entire requests, i.e. with queries and variables', function () {
        var query1 = (_a = ["\n      query authorStuff($id: Int) {\n        author(id: $id) {\n          name\n        }\n      }"], _a.raw = ["\n      query authorStuff($id: Int) {\n        author(id: $id) {\n          name\n        }\n      }"], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query personStuff($name: String) {\n        person(name: $name) {\n          id\n        }\n      }"], _b.raw = ["\n      query personStuff($name: String) {\n        person(name: $name) {\n          id\n        }\n      }"], graphql_tag_1.default(_b));
        var exp = (_c = ["\n      query ___composed($___authorStuff___requestIndex_0___id: Int, $___personStuff___requestIndex_1___name: String) {\n        ___authorStuff___requestIndex_0___fieldIndex_0: author(id: $___authorStuff___requestIndex_0___id) {\n          name\n        }\n        ___personStuff___requestIndex_1___fieldIndex_0: person(name: $___personStuff___requestIndex_1___name) {\n          id\n        }\n      }"], _c.raw = ["\n      query ___composed($___authorStuff___requestIndex_0___id: Int, $___personStuff___requestIndex_1___name: String) {\n        ___authorStuff___requestIndex_0___fieldIndex_0: author(id: $___authorStuff___requestIndex_0___id) {\n          name\n        }\n        ___personStuff___requestIndex_1___fieldIndex_0: person(name: $___personStuff___requestIndex_1___name) {\n          id\n        }\n      }"], graphql_tag_1.default(_c));
        var variables1 = {
            id: 18,
        };
        var variables2 = {
            name: 'John',
        };
        var expVariables = {
            ___authorStuff___requestIndex_0___id: 18,
            ___personStuff___requestIndex_1___name: 'John',
        };
        var request1 = {
            query: query1,
            variables: variables1,
        };
        var request2 = {
            query: query2,
            variables: variables2,
        };
        var requests = [request1, request2];
        var mergedRequest = queryMerging_1.mergeRequests(requests);
        chai_1.assert.equal(printer_1.print(mergedRequest.query), printer_1.print(exp));
        chai_1.assert.deepEqual(mergedRequest.variables, expVariables);
        chai_1.assert.equal(mergedRequest.debugName, '___composed');
        var _a, _b, _c;
    });
    it('should not incorrectly order the field index numbers given an inline fragment', function () {
        var query = (_a = ["\n      query authorStuff {\n        ... on RootQuery {\n          firstName\n          lastName\n        }\n        address\n      }"], _a.raw = ["\n      query authorStuff {\n        ... on RootQuery {\n          firstName\n          lastName\n        }\n        address\n      }"], graphql_tag_1.default(_a));
        var exp = (_b = ["\n      query ___composed {\n        ... on RootQuery {\n          ___authorStuff___requestIndex_0___fieldIndex_0: firstName\n          ___authorStuff___requestIndex_0___fieldIndex_1: lastName\n        }\n        ___authorStuff___requestIndex_0___fieldIndex_2: address\n      }"], _b.raw = ["\n      query ___composed {\n        ... on RootQuery {\n          ___authorStuff___requestIndex_0___fieldIndex_0: firstName\n          ___authorStuff___requestIndex_0___fieldIndex_1: lastName\n        }\n        ___authorStuff___requestIndex_0___fieldIndex_2: address\n      }"], graphql_tag_1.default(_b));
        var mergedQuery = queryMerging_1.mergeQueryDocuments([query]);
        chai_1.assert.equal(printer_1.print(mergedQuery), printer_1.print(exp));
        var _a, _b;
    });
    it('should throw an error if there is a ___ in the name of a variable', function () {
        var query = (_a = ["\n      query author($___id: Int) {\n        fortuneCookie\n      }"], _a.raw = ["\n      query author($___id: Int) {\n        fortuneCookie\n      }"], graphql_tag_1.default(_a));
        chai_1.assert.throws(function () {
            queryMerging_1.mergeQueryDocuments([query]);
        });
        var _a;
    });
    it('should throw an error if there is a ___ in the name of a fragment', function () {
        var query = (_a = ["\n      query {\n        ...___details\n      }\n      fragment ___details on RootQuery {\n        fortuneCookie\n      }"], _a.raw = ["\n      query {\n        ...___details\n      }\n      fragment ___details on RootQuery {\n        fortuneCookie\n      }"], graphql_tag_1.default(_a));
        chai_1.assert.throws(function () {
            queryMerging_1.mergeQueryDocuments([query]);
        });
        var _a;
    });
    it('should throw an error if there is a ___ in the name of a top-level field', function () {
        var query = (_a = ["\n      query {\n        ___fortuneCookie\n      }"], _a.raw = ["\n      query {\n        ___fortuneCookie\n      }"], graphql_tag_1.default(_a));
        chai_1.assert.throws(function () {
            queryMerging_1.mergeQueryDocuments([query]);
        });
        var _a;
    });
    it('should throw if there is a ___ in the name of a top-level field within a fragment', function () {
        var query = (_a = ["\n      query {\n        ...details\n      }\n      fragment details on RootQuery {\n        ___fortuneCookie\n      }"], _a.raw = ["\n      query {\n        ...details\n      }\n      fragment details on RootQuery {\n        ___fortuneCookie\n      }"], graphql_tag_1.default(_a));
        chai_1.assert.throws(function () {
            queryMerging_1.mergeQueryDocuments([query]);
        });
        var _a;
    });
    it('should not throw an error if there is a ___ in the name of a non-top-level field', function () {
        var query = (_a = ["\n      query {\n        author {\n          ___name\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          ___name\n        }\n      }"], graphql_tag_1.default(_a));
        chai_1.assert.doesNotThrow(function () {
            queryMerging_1.mergeQueryDocuments([query]);
        });
        var _a;
    });
    describe('merged query unpacking', function () {
        it('should unpack the merged result correctly for a single query', function () {
            var query = (_a = ["\n        query authorStuff {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query authorStuff {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var request = { query: query };
            var result = {
                data: {
                    ___authorStuff___requestIndex_0___fieldIndex_0: {
                        'firstName': 'John',
                        'lastName': 'Smith',
                    },
                },
            };
            var expResult = {
                'data': {
                    'author': {
                        'firstName': 'John',
                        'lastName': 'Smith',
                    },
                },
            };
            var results = queryMerging_1.unpackMergedResult(result, [request]);
            chai_1.assert.equal(results.length, 1);
            chai_1.assert.deepEqual(results[0], expResult);
            var _a;
        });
        it('should unpack queries with fragment spreads', function () {
            var query1 = (_a = ["\n        query authorStuff {\n          author {\n            ...authorInfo\n          }\n        }\n        fragment authorInfo on RootQuery {\n          firstName\n          lastName\n        }"], _a.raw = ["\n        query authorStuff {\n          author {\n            ...authorInfo\n          }\n        }\n        fragment authorInfo on RootQuery {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_a));
            var query2 = (_b = ["\n        query otherStuff {\n          ...authorInfo\n        }\n        fragment authorInfo on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }"], _b.raw = ["\n        query otherStuff {\n          ...authorInfo\n        }\n        fragment authorInfo on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_b));
            var requests = [{ query: query1 }, { query: query2 }];
            var result = {
                data: {
                    ___authorStuff___requestIndex_0___fieldIndex_0: {
                        ___authorStuff___requestIndex_0___fieldIndex_1: 'John',
                        ___authorStuff___requestIndex_0___fieldIndex_2: 'Smith',
                    },
                    ___otherStuff___requestIndex_1___fieldIndex_0: {
                        firstName: 'Jane',
                        lastName: 'Smith',
                    },
                },
            };
            var expUnpackedResults = [
                {
                    data: {
                        author: {
                            'firstName': 'John',
                            'lastName': 'Smith',
                        },
                    },
                },
                {
                    data: {
                        author: {
                            'firstName': 'Jane',
                            'lastName': 'Smith',
                        },
                    },
                },
            ];
            var unpackedResults = queryMerging_1.unpackMergedResult(result, requests);
            chai_1.assert.deepEqual(unpackedResults, expUnpackedResults);
            var _a, _b;
        });
        it('should be able to unpack queries with inlined fragments', function () {
            var query1 = (_a = ["\n        query authorStuff {\n          ... on RootQuery {\n            author {\n              firstName\n            }\n          }\n        }"], _a.raw = ["\n        query authorStuff {\n          ... on RootQuery {\n            author {\n              firstName\n            }\n          }\n        }"], graphql_tag_1.default(_a));
            var query2 = (_b = ["\n        query otherStuff {\n          ... on RootQuery {\n            author {\n              lastName\n            }\n          }\n        }"], _b.raw = ["\n        query otherStuff {\n          ... on RootQuery {\n            author {\n              lastName\n            }\n          }\n        }"], graphql_tag_1.default(_b));
            var result = {
                data: {
                    ___authorStuff___requestIndex_0___fieldIndex_0: {
                        firstName: 'John',
                    },
                    ___otherStuff___requestIndex_1___fieldIndex_0: {
                        lastName: 'Smith',
                    },
                },
            };
            var expUnpackedResults = [
                {
                    data: {
                        'author': {
                            'firstName': 'John',
                        },
                    },
                },
                {
                    data: {
                        'author': {
                            'lastName': 'Smith',
                        },
                    },
                },
            ];
            var request1 = { query: query1 };
            var request2 = { query: query2 };
            var requests = [request1, request2];
            var unpackedResults = queryMerging_1.unpackMergedResult(result, requests);
            chai_1.assert.deepEqual(unpackedResults, expUnpackedResults);
            var _a, _b;
        });
    });
    it('should throw an error if we try to apply an alias name to a mutation doc', function () {
        var mutation = (_a = ["\n      mutation modifyEverything {\n        fortuneCookie\n      }"], _a.raw = ["\n      mutation modifyEverything {\n        fortuneCookie\n      }"], graphql_tag_1.default(_a));
        var aliasName = 'totally_made_up';
        chai_1.assert.throws(function () {
            queryMerging_1.applyAliasNameToDocument(mutation, aliasName);
        });
        var _a;
    });
    it('should correctly unpack results that consist of multiple fields', function () {
        var query1 = (_a = ["\n      query authorStuff {\n        author {\n          firstName\n          lastName\n        }\n        __typename\n      }\n    "], _a.raw = ["\n      query authorStuff {\n        author {\n          firstName\n          lastName\n        }\n        __typename\n      }\n    "], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query personStuff {\n        person {\n          name\n        }\n      }"], _b.raw = ["\n      query personStuff {\n        person {\n          name\n        }\n      }"], graphql_tag_1.default(_b));
        var result1 = {
            data: {
                __typename: 'RootQuery',
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            },
        };
        var result2 = {
            data: {
                person: {
                    name: 'John Smith',
                },
            },
        };
        var composedResult = {
            data: {
                ___authorStuff___requestIndex_0___fieldIndex_0: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
                ___authorStuff___requestIndex_0___fieldIndex_1: 'RootQuery',
                ___personStuff___requestIndex_1___fieldIndex_0: {
                    name: 'John Smith',
                },
            },
        };
        var requests = [{ query: query1 }, { query: query2 }];
        var unpackedResults = queryMerging_1.unpackMergedResult(composedResult, requests);
        chai_1.assert.equal(unpackedResults.length, 2);
        chai_1.assert.deepEqual(unpackedResults[0], result1);
        chai_1.assert.deepEqual(unpackedResults[1], result2);
        var _a, _b;
    });
    it('should correctly merge two queries that are the same other than variable values', function () {
        var query1 = (_a = ["\n      query authorStuff($id: Int) {\n        author(id: $id) {\n          name\n        }\n      }"], _a.raw = ["\n      query authorStuff($id: Int) {\n        author(id: $id) {\n          name\n        }\n      }"], graphql_tag_1.default(_a));
        var query2 = (_b = ["\n      query authorStuff($id: Int) {\n        author(id: $id) {\n          name\n        }\n      }"], _b.raw = ["\n      query authorStuff($id: Int) {\n        author(id: $id) {\n          name\n        }\n      }"], graphql_tag_1.default(_b));
        var expQuery = (_c = ["\n      query ___composed($___authorStuff___requestIndex_0___id: Int, $___authorStuff___requestIndex_1___id: Int) {\n        ___authorStuff___requestIndex_0___fieldIndex_0: author(id: $___authorStuff___requestIndex_0___id) {\n          name\n        }\n\n        ___authorStuff___requestIndex_1___fieldIndex_0: author(id: $___authorStuff___requestIndex_1___id) {\n          name\n        }\n      }"], _c.raw = ["\n      query ___composed($___authorStuff___requestIndex_0___id: Int, $___authorStuff___requestIndex_1___id: Int) {\n        ___authorStuff___requestIndex_0___fieldIndex_0: author(id: $___authorStuff___requestIndex_0___id) {\n          name\n        }\n\n        ___authorStuff___requestIndex_1___fieldIndex_0: author(id: $___authorStuff___requestIndex_1___id) {\n          name\n        }\n      }"], graphql_tag_1.default(_c));
        var mergedRequest = queryMerging_1.mergeRequests([{ query: query1 }, { query: query2 }]);
        chai_1.assert.equal(printer_1.print(mergedRequest.query), printer_1.print(expQuery));
        var _a, _b, _c;
    });
    it('should be able to correctly merge queries with aliases', function () {
        var query = (_a = ["\n      query firstQuery {\n        someAlias: author {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query firstQuery {\n        someAlias: author {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
        var secondQuery = (_b = ["\n      query secondQuery {\n        person {\n          name\n        }\n      }"], _b.raw = ["\n      query secondQuery {\n        person {\n          name\n        }\n      }"], graphql_tag_1.default(_b));
        var expQuery = (_c = ["\n      query ___composed {\n        ___firstQuery___requestIndex_0___fieldIndex_0: author {\n          firstName\n          lastName\n        }\n\n        ___secondQuery___requestIndex_1___fieldIndex_0: person {\n          name\n        }\n     }"], _c.raw = ["\n      query ___composed {\n        ___firstQuery___requestIndex_0___fieldIndex_0: author {\n          firstName\n          lastName\n        }\n\n        ___secondQuery___requestIndex_1___fieldIndex_0: person {\n          name\n        }\n     }"], graphql_tag_1.default(_c));
        var firstResult = {
            someAlias: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var secondResult = {
            person: {
                name: 'Jane Smith',
            },
        };
        var composedResult = {
            ___firstQuery___requestIndex_0___fieldIndex_0: firstResult.someAlias,
            ___secondQuery___requestIndex_1___fieldIndex_0: secondResult.person,
        };
        var requests = [{ query: query }, { query: secondQuery }];
        var mergedRequest = queryMerging_1.mergeRequests(requests);
        chai_1.assert.equal(printer_1.print(mergedRequest.query), printer_1.print(expQuery));
        var unpackedResults = queryMerging_1.unpackMergedResult({ data: composedResult }, requests);
        chai_1.assert.equal(unpackedResults.length, 2);
        chai_1.assert.deepEqual(unpackedResults[0], { data: firstResult });
        chai_1.assert.deepEqual(unpackedResults[1], { data: secondResult });
        var _a, _b, _c;
    });
    describe('unpackDataForRequest', function () {
        var unpackQueryResult = function (query, data) {
            return queryMerging_1.unpackDataForRequest({
                request: { query: query },
                data: data,
                selectionSet: getFromAST_1.getQueryDefinition(query).selectionSet,
                queryIndex: 0,
                startIndex: 0,
                fragmentMap: getFromAST_1.createFragmentMap(getFromAST_1.getFragmentDefinitions(query)),
                topLevel: true,
            });
        };
        it('should work for a simple query', function () {
            var query = (_a = ["\n        query authorNames {\n          author {\n            name\n          }\n        }"], _a.raw = ["\n        query authorNames {\n          author {\n            name\n          }\n        }"], graphql_tag_1.default(_a));
            var result = {
                author: {
                    name: 'Dhaivat Pandya',
                },
            };
            var _b = unpackQueryResult(query, {
                ___authorNames___requestIndex_0___fieldIndex_0: {
                    name: 'Dhaivat Pandya',
                },
            }), newIndex = _b.newIndex, unpackedData = _b.unpackedData;
            chai_1.assert.equal(newIndex, 1);
            chai_1.assert.deepEqual(unpackedData, result);
            var _a;
        });
        it('should work for a query with an internal inline fragment', function () {
            var query = (_a = ["\n        query authorNames {\n          author {\n            ... on Author {\n              firstName\n              lastName\n            }\n          }\n        }"], _a.raw = ["\n        query authorNames {\n          author {\n            ... on Author {\n              firstName\n              lastName\n            }\n          }\n        }"], graphql_tag_1.default(_a));
            var result = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var _b = unpackQueryResult(query, {
                ___authorNames___requestIndex_0___fieldIndex_0: result.author,
            }), newIndex = _b.newIndex, unpackedData = _b.unpackedData;
            chai_1.assert.equal(newIndex, 1);
            chai_1.assert.deepEqual(unpackedData, result);
            var _a;
        });
        it('should work for a query with a toplevel inline fragment', function () {
            var query = (_a = ["\n        query authorNames {\n          ... on RootQuery {\n            author {\n              firstName\n              lastName\n            }\n          }\n        }"], _a.raw = ["\n        query authorNames {\n          ... on RootQuery {\n            author {\n              firstName\n              lastName\n            }\n          }\n        }"], graphql_tag_1.default(_a));
            var result = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var _b = unpackQueryResult(query, {
                ___authorNames___requestIndex_0___fieldIndex_0: result.author,
            }), newIndex = _b.newIndex, unpackedData = _b.unpackedData;
            chai_1.assert.equal(newIndex, 1);
            chai_1.assert.deepEqual(unpackedData, result);
            var _a;
        });
        it('should work for a query with an internal named fragment', function () {
            var query = (_a = ["\n        query authorNames {\n          author {\n            ...authorInfo\n          }\n        }\n        fragment authorInfo on Author {\n          firstName\n          lastName\n        }"], _a.raw = ["\n        query authorNames {\n          author {\n            ...authorInfo\n          }\n        }\n        fragment authorInfo on Author {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_a));
            var result = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var _b = unpackQueryResult(query, {
                '___authorNames___requestIndex_0___fieldIndex_0': {
                    '___authorNames___requestIndex_0___fieldIndex_1': 'John',
                    '___authorNames___requestIndex_0___fieldIndex_2': 'Smith',
                },
            }), newIndex = _b.newIndex, unpackedData = _b.unpackedData;
            chai_1.assert.equal(newIndex, 3);
            chai_1.assert.deepEqual(unpackedData, result);
            var _a;
        });
        it('should work for a query with a toplevel named fragment', function () {
            var query = (_a = ["\n        query authorNames {\n          ...authorInfo\n        }\n        fragment authorInfo on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query authorNames {\n          ...authorInfo\n        }\n        fragment authorInfo on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var result = {
                author: {
                    firstName: 'John',
                    lastName: 'Smith',
                },
            };
            var _b = unpackQueryResult(query, {
                '___authorNames___requestIndex_0___fieldIndex_0': {
                    'firstName': 'John',
                    'lastName': 'Smith',
                },
            }), newIndex = _b.newIndex, unpackedData = _b.unpackedData;
            chai_1.assert.equal(newIndex, 1);
            chai_1.assert.deepEqual(unpackedData, result);
            var _a;
        });
        it('should work for a query with a fragment referencing a fragment', function () {
            var query = (_a = ["\n        query authorNames {\n          ...authorInfo\n        }\n        fragment authorInfo on RootQuery {\n          author {\n            ...nameProperty\n          }\n        }\n        fragment nameProperty on Author {\n          name\n        }"], _a.raw = ["\n        query authorNames {\n          ...authorInfo\n        }\n        fragment authorInfo on RootQuery {\n          author {\n            ...nameProperty\n          }\n        }\n        fragment nameProperty on Author {\n          name\n        }"], graphql_tag_1.default(_a));
            var result = {
                author: {
                    name: 'John Smith',
                },
            };
            var unpackedData = unpackQueryResult(query, {
                '___authorNames___requestIndex_0___fieldIndex_0': {
                    '___authorNames___requestIndex_0___fieldIndex_1': 'John Smith',
                },
            }).unpackedData;
            chai_1.assert.deepEqual(unpackedData, result);
            var _a;
        });
        it('should work for a query with a json blob request', function () {
            var query = (_a = ["\n        query authorNames {\n          author {\n            info\n          }\n        }"], _a.raw = ["\n        query authorNames {\n          author {\n            info\n          }\n        }"], graphql_tag_1.default(_a));
            var result = {
                author: {
                    info: {
                        name: 'John Smith',
                        address: '404 Http St',
                    },
                },
            };
            var unpackedData = unpackQueryResult(query, {
                '___authorNames___requestIndex_0___fieldIndex_0': {
                    info: result.author.info,
                },
            }).unpackedData;
            chai_1.assert.deepEqual(unpackedData, result);
            var _a;
        });
    });
});
//# sourceMappingURL=queryMerging.js.map