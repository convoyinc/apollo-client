"use strict";
var chai_1 = require('chai');
var writeToStore_1 = require('../src/data/writeToStore');
var readFromStore_1 = require('../src/data/readFromStore');
var getFromAST_1 = require('../src/queries/getFromAST');
var graphql_tag_1 = require('graphql-tag');
describe('roundtrip', function () {
    it('real graphql result', function () {
        storeRoundtrip((_a = ["\n      {\n        people_one(id: \"1\") {\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people_one(id: \"1\") {\n          name\n        }\n      }\n    "], graphql_tag_1.default(_a)), {
            people_one: {
                name: 'Luke Skywalker',
            },
        });
        var _a;
    });
    it('with an alias', function () {
        storeRoundtrip((_a = ["\n      {\n        luke: people_one(id: \"1\") {\n          name,\n        },\n        vader: people_one(id: \"4\") {\n          name,\n        }\n      }\n    "], _a.raw = ["\n      {\n        luke: people_one(id: \"1\") {\n          name,\n        },\n        vader: people_one(id: \"4\") {\n          name,\n        }\n      }\n    "], graphql_tag_1.default(_a)), {
            luke: {
                name: 'Luke Skywalker',
            },
            vader: {
                name: 'Darth Vader',
            },
        });
        var _a;
    });
    it('with variables', function () {
        storeRoundtrip((_a = ["\n      {\n        luke: people_one(id: $lukeId) {\n          name,\n        },\n        vader: people_one(id: $vaderId) {\n          name,\n        }\n      }\n    "], _a.raw = ["\n      {\n        luke: people_one(id: $lukeId) {\n          name,\n        },\n        vader: people_one(id: $vaderId) {\n          name,\n        }\n      }\n    "], graphql_tag_1.default(_a)), {
            luke: {
                name: 'Luke Skywalker',
            },
            vader: {
                name: 'Darth Vader',
            },
        }, {
            lukeId: '1',
            vaderId: '4',
        });
        var _a;
    });
    it('with GraphQLJSON scalar type', function () {
        storeRoundtrip((_a = ["\n      {\n        updateClub {\n          uid,\n          name,\n          settings\n        }\n      }\n    "], _a.raw = ["\n      {\n        updateClub {\n          uid,\n          name,\n          settings\n        }\n      }\n    "], graphql_tag_1.default(_a)), {
            updateClub: {
                uid: '1d7f836018fc11e68d809dfee940f657',
                name: 'Eple',
                settings: {
                    name: 'eple',
                    currency: 'AFN',
                    calendarStretch: 2,
                    defaultPreAllocationPeriod: 1,
                    confirmationEmailCopy: null,
                    emailDomains: null,
                },
            },
        });
        var _a;
    });
    describe('directives', function () {
        it('should be able to query with skip directive true', function () {
            storeRoundtrip((_a = ["\n        query {\n          fortuneCookie @skip(if: true)\n        }\n      "], _a.raw = ["\n        query {\n          fortuneCookie @skip(if: true)\n        }\n      "], graphql_tag_1.default(_a)), {});
            var _a;
        });
        it('should be able to query with skip directive false', function () {
            storeRoundtrip((_a = ["\n        query {\n          fortuneCookie @skip(if: false)\n        }\n      "], _a.raw = ["\n        query {\n          fortuneCookie @skip(if: false)\n        }\n      "], graphql_tag_1.default(_a)), { fortuneCookie: 'live long and prosper' });
            var _a;
        });
    });
    describe('fragments', function () {
        it('should resolve on union types with inline fragments', function () {
            storeRoundtrip((_a = ["\n        query {\n          all_people {\n            name\n            ... on Jedi {\n              side\n            }\n            ... on Droid {\n              model\n            }\n          }\n        }"], _a.raw = ["\n        query {\n          all_people {\n            name\n            ... on Jedi {\n              side\n            }\n            ... on Droid {\n              model\n            }\n          }\n        }"], graphql_tag_1.default(_a)), {
                all_people: [
                    {
                        name: 'Luke Skywalker',
                        side: 'bright',
                    },
                    {
                        name: 'R2D2',
                        model: 'astromech',
                    },
                ],
            });
            var _a;
        });
        it('should throw an error on two of the same inline fragment types', function () {
            chai_1.assert.throws(function () {
                storeRoundtrip((_a = ["\n          query {\n            all_people {\n              name\n              ... on Jedi {\n                side\n              }\n              ... on Jedi {\n                rank\n              }\n            }\n          }"], _a.raw = ["\n          query {\n            all_people {\n              name\n              ... on Jedi {\n                side\n              }\n              ... on Jedi {\n                rank\n              }\n            }\n          }"], graphql_tag_1.default(_a)), {
                    all_people: [
                        {
                            name: 'Luke Skywalker',
                            side: 'bright',
                        },
                    ],
                });
                var _a;
            }, /Can\'t find field rank on result object/);
        });
        it('should resolve on union types with spread fragments', function () {
            storeRoundtrip((_a = ["\n        fragment jediFragment on Jedi {\n          side\n        }\n\n        fragment droidFragment on Droid {\n          model\n        }\n\n        query {\n          all_people {\n            name\n            ...jediFragment\n            ...droidFragment\n          }\n        }"], _a.raw = ["\n        fragment jediFragment on Jedi {\n          side\n        }\n\n        fragment droidFragment on Droid {\n          model\n        }\n\n        query {\n          all_people {\n            name\n            ...jediFragment\n            ...droidFragment\n          }\n        }"], graphql_tag_1.default(_a)), {
                all_people: [
                    {
                        name: 'Luke Skywalker',
                        side: 'bright',
                    },
                    {
                        name: 'R2D2',
                        model: 'astromech',
                    },
                ],
            });
            var _a;
        });
        it('should throw on error on two of the same spread fragment types', function () {
            chai_1.assert.throws(function () {
                return storeRoundtrip((_a = ["\n          fragment jediSide on Jedi {\n            side\n          }\n\n          fragment jediRank on Jedi {\n            rank\n          }\n\n          query {\n            all_people {\n              name\n              ...jediSide\n              ...jediRank\n            }\n          }"], _a.raw = ["\n          fragment jediSide on Jedi {\n            side\n          }\n\n          fragment jediRank on Jedi {\n            rank\n          }\n\n          query {\n            all_people {\n              name\n              ...jediSide\n              ...jediRank\n            }\n          }"], graphql_tag_1.default(_a)), {
                    all_people: [
                        {
                            name: 'Luke Skywalker',
                            side: 'bright',
                        },
                    ],
                });
                var _a;
            }, /Can\'t find field rank on result object/);
        });
        it('should resolve on @include and @skip with inline fragments', function () {
            storeRoundtrip((_a = ["\n        query {\n          person {\n            name\n            ... on Jedi @include(if: true) {\n              side\n            }\n            ... on Droid @skip(if: true) {\n              model\n            }\n          }\n        }"], _a.raw = ["\n        query {\n          person {\n            name\n            ... on Jedi @include(if: true) {\n              side\n            }\n            ... on Droid @skip(if: true) {\n              model\n            }\n          }\n        }"], graphql_tag_1.default(_a)), {
                person: {
                    name: 'Luke Skywalker',
                    side: 'bright',
                },
            });
            var _a;
        });
        it('should resolve on @include and @skip with spread fragments', function () {
            storeRoundtrip((_a = ["\n        fragment jediFragment on Jedi {\n          side\n        }\n\n        fragment droidFragment on Droid {\n          model\n        }\n\n        query {\n          person {\n            name\n            ...jediFragment @include(if: true)\n            ...droidFragment @skip(if: true)\n          }\n        }"], _a.raw = ["\n        fragment jediFragment on Jedi {\n          side\n        }\n\n        fragment droidFragment on Droid {\n          model\n        }\n\n        query {\n          person {\n            name\n            ...jediFragment @include(if: true)\n            ...droidFragment @skip(if: true)\n          }\n        }"], graphql_tag_1.default(_a)), {
                person: {
                    name: 'Luke Skywalker',
                    side: 'bright',
                },
            });
            var _a;
        });
    });
});
function storeRoundtrip(query, result, variables) {
    if (variables === void 0) { variables = {}; }
    var fragmentMap = getFromAST_1.createFragmentMap(getFromAST_1.getFragmentDefinitions(query));
    var store = writeToStore_1.writeQueryToStore({
        result: result,
        query: query,
        variables: variables,
        fragmentMap: fragmentMap,
    });
    var reconstructedResult = readFromStore_1.readQueryFromStore({
        store: store,
        query: query,
        variables: variables,
        fragmentMap: fragmentMap,
    });
    chai_1.assert.deepEqual(result, reconstructedResult);
}
//# sourceMappingURL=roundtrip.js.map