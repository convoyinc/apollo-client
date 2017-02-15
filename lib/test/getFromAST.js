import { checkDocument, getFragmentDefinitions, getQueryDefinition, getMutationDefinition, createFragmentMap, getOperationName, } from '../src/queries/getFromAST';
import { print } from 'graphql-tag/printer';
import gql from 'graphql-tag';
import { assert } from 'chai';
describe('AST utility functions', function () {
    it('should correctly check a document for correctness', function () {
        var multipleQueries = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n      query {\n        author {\n          address\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n      query {\n        author {\n          address\n        }\n      }"], gql(_a));
        assert.throws(function () {
            checkDocument(multipleQueries);
        });
        var namedFragment = (_b = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _b.raw = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], gql(_b));
        assert.doesNotThrow(function () {
            checkDocument(namedFragment);
        });
        var _a, _b;
    });
    it('should get fragment definitions from a document containing a single fragment', function () {
        var singleFragmentDefinition = (_a = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], gql(_a));
        var expectedDoc = (_b = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _b.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], gql(_b));
        var expectedResult = [expectedDoc.definitions[0]];
        var actualResult = getFragmentDefinitions(singleFragmentDefinition);
        assert.equal(actualResult.length, expectedResult.length);
        assert.equal(print(actualResult[0]), print(expectedResult[0]));
        var _a, _b;
    });
    it('should get fragment definitions from a document containing a multiple fragments', function () {
        var multipleFragmentDefinitions = (_a = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], gql(_a));
        var expectedDoc = (_b = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], _b.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], gql(_b));
        var expectedResult = [
            expectedDoc.definitions[0],
            expectedDoc.definitions[1],
        ];
        var actualResult = getFragmentDefinitions(multipleFragmentDefinitions);
        assert.deepEqual(actualResult.map(print), expectedResult.map(print));
        var _a, _b;
    });
    it('should get the correct query definition out of a query containing multiple fragments', function () {
        var queryWithFragments = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }"], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }"], gql(_a));
        var expectedDoc = (_b = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }"], gql(_b));
        var expectedResult = expectedDoc.definitions[0];
        var actualResult = getQueryDefinition(queryWithFragments);
        assert.equal(print(actualResult), print(expectedResult));
        var _a, _b;
    });
    it('should throw if we try to get the query definition of a document with no query', function () {
        var mutationWithFragments = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }"], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }"], gql(_a));
        assert.throws(function () {
            getQueryDefinition(mutationWithFragments);
        });
        var _a;
    });
    it('should get the correct mutation definition out of a mutation with multiple fragments', function () {
        var mutationWithFragments = (_a = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], _a.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }"], gql(_a));
        var expectedDoc = (_b = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }"], _b.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }"], gql(_b));
        var expectedResult = expectedDoc.definitions[0];
        var actualResult = getMutationDefinition(mutationWithFragments);
        assert.equal(print(actualResult), print(expectedResult));
        var _a, _b;
    });
    it('should create the fragment map correctly', function () {
        var fragments = getFragmentDefinitions((_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n      fragment moreAuthorDetails on Author {\n        address\n      }"], gql(_a)));
        var fragmentMap = createFragmentMap(fragments);
        var expectedTable = {
            'authorDetails': fragments[0],
            'moreAuthorDetails': fragments[1],
        };
        assert.deepEqual(fragmentMap, expectedTable);
        var _a;
    });
    it('should return an empty fragment map if passed undefined argument', function () {
        assert.deepEqual(createFragmentMap(undefined), {});
    });
    it('should get the operation name out of a query', function () {
        var query = (_a = ["\n      query nameOfQuery {\n        fortuneCookie\n      }"], _a.raw = ["\n      query nameOfQuery {\n        fortuneCookie\n      }"], gql(_a));
        var operationName = getOperationName(query);
        assert.equal(operationName, 'nameOfQuery');
        var _a;
    });
    it('should get the operation name out of a mutation', function () {
        var query = (_a = ["\n      mutation nameOfMutation {\n        fortuneCookie\n      }"], _a.raw = ["\n      mutation nameOfMutation {\n        fortuneCookie\n      }"], gql(_a));
        var operationName = getOperationName(query);
        assert.equal(operationName, 'nameOfMutation');
        var _a;
    });
    it('should throw if type definitions found in document', function () {
        var queryWithTypeDefination = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      query($search: AuthorSearchInputType) {\n        author(search: $search) {\n          ...authorDetails\n        }\n      }\n\n      input AuthorSearchInputType {\n        firstName: String\n      }"], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      query($search: AuthorSearchInputType) {\n        author(search: $search) {\n          ...authorDetails\n        }\n      }\n\n      input AuthorSearchInputType {\n        firstName: String\n      }"], gql(_a));
        assert.throws(function () {
            getQueryDefinition(queryWithTypeDefination);
        }, 'Schema type definitions not allowed in queries. Found: "InputObjectTypeDefinition"');
        var _a;
    });
});
//# sourceMappingURL=getFromAST.js.map