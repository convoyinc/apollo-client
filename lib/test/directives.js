"use strict";
var chai = require("chai");
var assert = chai.assert;
var directives_1 = require("../src/queries/directives");
var getFromAST_1 = require("../src/queries/getFromAST");
var graphql_tag_1 = require("graphql-tag");
var cloneDeep = require("lodash/cloneDeep");
describe('query directives', function () {
    it('should should not include a skipped field', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: true)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: true)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(!directives_1.shouldInclude(field, {}));
        var _a;
    });
    it('should include an included field', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(if: true)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @include(if: true)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(directives_1.shouldInclude(field, {}));
        var _a;
    });
    it('should not include a not include: false field', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(if: false)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @include(if: false)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(!directives_1.shouldInclude(field, {}));
        var _a;
    });
    it('should include a skip: false field', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: false)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: false)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(directives_1.shouldInclude(field, {}));
        var _a;
    });
    it('should not include a field if skip: true and include: true', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: true) @include(if: true)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: true) @include(if: true)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(!directives_1.shouldInclude(field, {}));
        var _a;
    });
    it('should not include a field if skip: true and include: false', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: true) @include(if: false)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: true) @include(if: false)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(!directives_1.shouldInclude(field, {}));
        var _a;
    });
    it('should include a field if skip: false and include: true', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if:false) @include(if: true)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @skip(if:false) @include(if: true)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(directives_1.shouldInclude(field, {}));
        var _a;
    });
    it('should not include a field if skip: false and include: false', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: false)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: false)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(!directives_1.shouldInclude(field, {}));
        var _a;
    });
    it('should leave the original query unmodified', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: false)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: false)\n      }"], graphql_tag_1.default(_a));
        var queryClone = cloneDeep(query);
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        directives_1.shouldInclude(field, {});
        assert.deepEqual(query, queryClone);
        var _a;
    });
    it('does not throw an error on an unsupported directive', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @dosomething(if: true)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @dosomething(if: true)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert.doesNotThrow(function () {
            directives_1.shouldInclude(field, {});
        });
        var _a;
    });
    it('throws an error on an invalid argument for the skip directive', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(nothing: true)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @skip(nothing: true)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert.throws(function () {
            directives_1.shouldInclude(field, {});
        });
        var _a;
    });
    it('throws an error on an invalid argument for the include directive', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(nothing: true)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @include(nothing: true)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert.throws(function () {
            directives_1.shouldInclude(field, {});
        });
        var _a;
    });
    it('throws an error on an invalid variable name within a directive argument', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(if: $neverDefined)\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @include(if: $neverDefined)\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert.throws(function () {
            directives_1.shouldInclude(field, {});
        });
        var _a;
    });
    it('evaluates variables on skip fields', function () {
        var query = (_a = ["\n      query($shouldSkip: Boolean) {\n        fortuneCookie @skip(if: $shouldSkip)\n      }"], _a.raw = ["\n      query($shouldSkip: Boolean) {\n        fortuneCookie @skip(if: $shouldSkip)\n      }"], graphql_tag_1.default(_a));
        var variables = {
            shouldSkip: true,
        };
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(!directives_1.shouldInclude(field, variables));
        var _a;
    });
    it('evaluates variables on include fields', function () {
        var query = (_a = ["\n      query($shouldSkip: Boolean) {\n        fortuneCookie @include(if: $shouldInclude)\n      }"], _a.raw = ["\n      query($shouldSkip: Boolean) {\n        fortuneCookie @include(if: $shouldInclude)\n      }"], graphql_tag_1.default(_a));
        var variables = {
            shouldInclude: false,
        };
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert(!directives_1.shouldInclude(field, variables));
        var _a;
    });
    it('throws an error if the value of the argument is not a variable or boolean', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(if: \"string\")\n      }"], _a.raw = ["\n      query {\n        fortuneCookie @include(if: \"string\")\n      }"], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        assert.throws(function () {
            directives_1.shouldInclude(field, {});
        });
        var _a;
    });
});
//# sourceMappingURL=directives.js.map