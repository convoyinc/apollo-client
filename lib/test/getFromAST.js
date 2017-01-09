"use strict";
var getFromAST_1 = require("../src/queries/getFromAST");
var src_1 = require("../src");
var printer_1 = require("graphql-tag/printer");
var graphql_tag_1 = require("graphql-tag");
var chai_1 = require("chai");
describe('AST utility functions', function () {
    it('should correctly check a document for correctness', function () {
        var multipleQueries = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n      query {\n        author {\n          address\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n      query {\n        author {\n          address\n        }\n      }"], graphql_tag_1.default(_a));
        chai_1.assert.throws(function () {
            getFromAST_1.checkDocument(multipleQueries);
        });
        var namedFragment = (_b = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _b.raw = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_b));
        chai_1.assert.doesNotThrow(function () {
            getFromAST_1.checkDocument(namedFragment);
        });
        var _a, _b;
    });
    it('should get fragment definitions from a document containing a single fragment', function () {
        var singleFragmentDefinition = (_a = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_a));
        var expectedDoc = (_b = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _b.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_b));
        var expectedResult = [expectedDoc.definitions[0]];
        var actualResult = getFromAST_1.getFragmentDefinitions(singleFragmentDefinition);
        chai_1.assert.equal(actualResult.length, expectedResult.length);
        chai_1.assert.equal(printer_1.print(actualResult[0]), printer_1.print(expectedResult[0]));
        var _a, _b;
    });
    it('should get fragment definitions from a document containing a multiple fragments', function () {
        var multipleFragmentDefinitions = (_a = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], graphql_tag_1.default(_a));
        var expectedDoc = (_b = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], _b.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], graphql_tag_1.default(_b));
        var expectedResult = [
            expectedDoc.definitions[0],
            expectedDoc.definitions[1],
        ];
        var actualResult = getFromAST_1.getFragmentDefinitions(multipleFragmentDefinitions);
        chai_1.assert.deepEqual(actualResult.map(printer_1.print), expectedResult.map(printer_1.print));
        var _a, _b;
    });
    it('should get the correct query definition out of a query containing multiple fragments', function () {
        var queryWithFragments = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }"], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }"], graphql_tag_1.default(_a));
        var expectedDoc = (_b = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }"], graphql_tag_1.default(_b));
        var expectedResult = expectedDoc.definitions[0];
        var actualResult = getFromAST_1.getQueryDefinition(queryWithFragments);
        chai_1.assert.equal(printer_1.print(actualResult), printer_1.print(expectedResult));
        var _a, _b;
    });
    it('should throw if we try to get the query definition of a document with no query', function () {
        var mutationWithFragments = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }"], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }"], graphql_tag_1.default(_a));
        chai_1.assert.throws(function () {
            getFromAST_1.getQueryDefinition(mutationWithFragments);
        });
        var _a;
    });
    it('should get the correct mutation definition out of a mutation with multiple fragments', function () {
        var mutationWithFragments = (_a = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], graphql_tag_1.default(_a));
        var expectedDoc = (_b = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }"], _b.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }"], graphql_tag_1.default(_b));
        var expectedResult = expectedDoc.definitions[0];
        var actualResult = getFromAST_1.getMutationDefinition(mutationWithFragments);
        chai_1.assert.equal(printer_1.print(actualResult), printer_1.print(expectedResult));
        var _a, _b;
    });
    it('should create the fragment map correctly', function () {
        var fragments = getFromAST_1.getFragmentDefinitions((_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], graphql_tag_1.default(_a)));
        var fragmentMap = getFromAST_1.createFragmentMap(fragments);
        var expectedTable = {
            'authorDetails': fragments[0],
            'moreAuthorDetails': fragments[1],
        };
        chai_1.assert.deepEqual(fragmentMap, expectedTable);
        var _a;
    });
    it('should return an empty fragment map if passed undefined argument', function () {
        chai_1.assert.deepEqual(getFromAST_1.createFragmentMap(undefined), {});
    });
    it('should get the operation name out of a query', function () {
        var query = (_a = ["\n      query nameOfQuery {\n        fortuneCookie\n      }"], _a.raw = ["\n      query nameOfQuery {\n        fortuneCookie\n      }"], graphql_tag_1.default(_a));
        var operationName = getFromAST_1.getOperationName(query);
        chai_1.assert.equal(operationName, 'nameOfQuery');
        var _a;
    });
    it('should get the operation name out of a mutation', function () {
        var query = (_a = ["\n      mutation nameOfMutation {\n        fortuneCookie\n      }"], _a.raw = ["\n      mutation nameOfMutation {\n        fortuneCookie\n      }"], graphql_tag_1.default(_a));
        var operationName = getFromAST_1.getOperationName(query);
        chai_1.assert.equal(operationName, 'nameOfMutation');
        var _a;
    });
    it('should throw if type definitions found in document', function () {
        var queryWithTypeDefination = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      query($search: AuthorSearchInputType) {\n        author(search: $search) {\n          ...authorDetails\n        }\n      }\n\n      input AuthorSearchInputType {\n        firstName: String\n      }"], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      query($search: AuthorSearchInputType) {\n        author(search: $search) {\n          ...authorDetails\n        }\n      }\n\n      input AuthorSearchInputType {\n        firstName: String\n      }"], graphql_tag_1.default(_a));
        chai_1.assert.throws(function () {
            getFromAST_1.getQueryDefinition(queryWithTypeDefination);
        }, 'Schema type definitions not allowed in queries. Found: "InputObjectTypeDefinition"');
        var _a;
    });
    it('should attach fragments properly', function () {
        var subjectInfo = src_1.createFragment((_a = ["\n      fragment subjectInfo on Subject {\n        id\n        name\n      }"], _a.raw = ["\n      fragment subjectInfo on Subject {\n        id\n        name\n      }"], graphql_tag_1.default(_a)));
        var businessAreaInfo = src_1.createFragment((_b = ["\n      fragment businessAreaInfo on BusinessArea {\n        id\n        name\n        subjects {\n          ...subjectInfo\n        }\n      }"], _b.raw = ["\n      fragment businessAreaInfo on BusinessArea {\n        id\n        name\n        subjects {\n          ...subjectInfo\n        }\n      }"], graphql_tag_1.default(_b)), [subjectInfo]);
        var query = (_c = ["\n      query {\n        businessAreas {\n          ...businessAreaInfo\n        }\n      }\n    "], _c.raw = ["\n      query {\n        businessAreas {\n          ...businessAreaInfo\n        }\n      }\n    "], graphql_tag_1.default(_c));
        var fullDoc = getFromAST_1.addFragmentsToDocument(query, businessAreaInfo);
        chai_1.assert.equal(printer_1.print(fullDoc), "{\n  businessAreas {\n    ...businessAreaInfo\n  }\n}\n\nfragment subjectInfo on Subject {\n  id\n  name\n}\n\nfragment businessAreaInfo on BusinessArea {\n  id\n  name\n  subjects {\n    ...subjectInfo\n  }\n}\n");
        var _a, _b, _c;
    });
    it('should only attach distinct fragments', function () {
        var subjectInfo = src_1.createFragment((_a = ["\n      fragment subjectInfo on Subject {\n        id\n        name\n      }"], _a.raw = ["\n      fragment subjectInfo on Subject {\n        id\n        name\n      }"], graphql_tag_1.default(_a)));
        var businessAreaInfo = src_1.createFragment((_b = ["\n      fragment businessAreaInfo on BusinessArea {\n        id\n        name\n        subjects {\n          ...subjectInfo\n        }\n      }"], _b.raw = ["\n      fragment businessAreaInfo on BusinessArea {\n        id\n        name\n        subjects {\n          ...subjectInfo\n        }\n      }"], graphql_tag_1.default(_b)), [subjectInfo, subjectInfo]);
        var whateverAreaInfo = src_1.createFragment((_c = ["\n      fragment whateverAreaInfo on WhateverArea {\n        subject {\n          ...subjectInfo\n        }\n      }"], _c.raw = ["\n      fragment whateverAreaInfo on WhateverArea {\n        subject {\n          ...subjectInfo\n        }\n      }"], graphql_tag_1.default(_c)), [subjectInfo]);
        var query = (_d = ["\n      query {\n        businessAreas {\n          ...businessAreaInfo\n        }\n        whateverAreas {\n          ...whateverAreaInfo\n        }\n      }\n\n      #fragment subjectInfo on Subject {\n      #  id\n      #  name\n      #}\n    "], _d.raw = ["\n      query {\n        businessAreas {\n          ...businessAreaInfo\n        }\n        whateverAreas {\n          ...whateverAreaInfo\n        }\n      }\n\n      #fragment subjectInfo on Subject {\n      #  id\n      #  name\n      #}\n    "], graphql_tag_1.default(_d));
        var fullDoc = getFromAST_1.addFragmentsToDocument(query, businessAreaInfo);
        fullDoc = getFromAST_1.addFragmentsToDocument(fullDoc, whateverAreaInfo);
        fullDoc = getFromAST_1.addFragmentsToDocument(fullDoc, subjectInfo);
        chai_1.assert.equal(printer_1.print(fullDoc), "{\n  businessAreas {\n    ...businessAreaInfo\n  }\n  whateverAreas {\n    ...whateverAreaInfo\n  }\n}\n\nfragment subjectInfo on Subject {\n  id\n  name\n}\n\nfragment businessAreaInfo on BusinessArea {\n  id\n  name\n  subjects {\n    ...subjectInfo\n  }\n}\n\nfragment whateverAreaInfo on WhateverArea {\n  subject {\n    ...subjectInfo\n  }\n}\n");
        var _a, _b, _c, _d;
    });
});
//# sourceMappingURL=getFromAST.js.map