import { assert } from 'chai';
import gql from 'graphql-tag';
import { InMemoryCache } from '../src/data/inMemoryCache';
import { toIdValue } from '../src/data/storeUtils';
describe('Cache', function () {
    function createCache(_a) {
        var _b = _a === void 0 ? {} : _a, initialState = _b.initialState, config = _b.config;
        return new InMemoryCache(config || {}, initialState ? initialState.apollo.data : {});
    }
    describe('readQuery', function () {
        it('will read some data from the store', function () {
            var proxy = createCache({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                a: 1,
                                b: 2,
                                c: 3,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readQuery({
                query: (_a = ["\n            {\n              a\n            }\n          "], _a.raw = ["\n            {\n              a\n            }\n          "], gql(_a)),
            }), { a: 1 });
            assert.deepEqual(proxy.readQuery({
                query: (_b = ["\n            {\n              b\n              c\n            }\n          "], _b.raw = ["\n            {\n              b\n              c\n            }\n          "], gql(_b)),
            }), { b: 2, c: 3 });
            assert.deepEqual(proxy.readQuery({
                query: (_c = ["\n            {\n              a\n              b\n              c\n            }\n          "], _c.raw = ["\n            {\n              a\n              b\n              c\n            }\n          "], gql(_c)),
            }), { a: 1, b: 2, c: 3 });
            var _a, _b, _c;
        });
        it('will read some deeply nested data from the store', function () {
            var proxy = createCache({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                a: 1,
                                b: 2,
                                c: 3,
                                d: {
                                    type: 'id',
                                    id: 'foo',
                                    generated: false,
                                },
                            },
                            foo: {
                                e: 4,
                                f: 5,
                                g: 6,
                                h: {
                                    type: 'id',
                                    id: 'bar',
                                    generated: false,
                                },
                            },
                            bar: {
                                i: 7,
                                j: 8,
                                k: 9,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readQuery({
                query: (_a = ["\n            {\n              a\n              d {\n                e\n              }\n            }\n          "], _a.raw = ["\n            {\n              a\n              d {\n                e\n              }\n            }\n          "], gql(_a)),
            }), { a: 1, d: { e: 4 } });
            assert.deepEqual(proxy.readQuery({
                query: (_b = ["\n            {\n              a\n              d {\n                e\n                h {\n                  i\n                }\n              }\n            }\n          "], _b.raw = ["\n            {\n              a\n              d {\n                e\n                h {\n                  i\n                }\n              }\n            }\n          "], gql(_b)),
            }), { a: 1, d: { e: 4, h: { i: 7 } } });
            assert.deepEqual(proxy.readQuery({
                query: (_c = ["\n            {\n              a\n              b\n              c\n              d {\n                e\n                f\n                g\n                h {\n                  i\n                  j\n                  k\n                }\n              }\n            }\n          "], _c.raw = ["\n            {\n              a\n              b\n              c\n              d {\n                e\n                f\n                g\n                h {\n                  i\n                  j\n                  k\n                }\n              }\n            }\n          "], gql(_c)),
            }), { a: 1, b: 2, c: 3, d: { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } } });
            var _a, _b, _c;
        });
        it('will read data using custom resolvers', function () {
            var proxy = createCache({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                __typename: 'Query',
                            },
                            foo: {
                                id: 'foo',
                                a: 1,
                                b: '2',
                                c: null,
                            },
                        },
                    },
                },
                config: {
                    dataIdFromObject: function (object) { return object.id; },
                    customResolvers: {
                        Query: {
                            thing: function (_, args) { return toIdValue(args.id); },
                        },
                    },
                },
            });
            var queryResult = proxy.readQuery({
                query: (_a = ["\n          query {\n            thing(id: \"foo\") {\n              a\n              b\n              c\n            }\n          }\n        "], _a.raw = ["\n          query {\n            thing(id: \"foo\") {\n              a\n              b\n              c\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(queryResult, {
                thing: { a: 1, b: '2', c: null },
            });
            var _a;
        });
        it('will read some data from the store with variables', function () {
            var proxy = createCache({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                'field({"literal":true,"value":42})': 1,
                                'field({"literal":false,"value":42})': 2,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readQuery({
                query: (_a = ["\n            query($literal: Boolean, $value: Int) {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], _a.raw = ["\n            query($literal: Boolean, $value: Int) {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            }), { a: 1, b: 2 });
            var _a;
        });
    });
    describe('readFragment', function () {
        it('will throw an error when there is no fragment', function () {
            var proxy = createCache();
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            query {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            query {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            schema {\n              query: Query\n            }\n          "], _a.raw = ["\n            schema {\n              query: Query\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will throw an error when there is more than one fragment but no fragment name', function () {
            var proxy = createCache();
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will read some deeply nested data from the store at any id', function () {
            var proxy = createCache({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                __typename: 'Type1',
                                a: 1,
                                b: 2,
                                c: 3,
                                d: {
                                    type: 'id',
                                    id: 'foo',
                                    generated: false,
                                },
                            },
                            foo: {
                                __typename: 'Foo',
                                e: 4,
                                f: 5,
                                g: 6,
                                h: {
                                    type: 'id',
                                    id: 'bar',
                                    generated: false,
                                },
                            },
                            bar: {
                                __typename: 'Bar',
                                i: 7,
                                j: 8,
                                k: 9,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment fragmentFoo on Foo {\n              e\n              h {\n                i\n              }\n            }\n          "], _a.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              h {\n                i\n              }\n            }\n          "], gql(_a)),
            }), { e: 4, h: { i: 7 } });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_b = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          "], _b.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          "], gql(_b)),
            }), { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } });
            assert.deepEqual(proxy.readFragment({
                id: 'bar',
                fragment: (_c = ["\n            fragment fragmentBar on Bar {\n              i\n            }\n          "], _c.raw = ["\n            fragment fragmentBar on Bar {\n              i\n            }\n          "], gql(_c)),
            }), { i: 7 });
            assert.deepEqual(proxy.readFragment({
                id: 'bar',
                fragment: (_d = ["\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _d.raw = ["\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_d)),
            }), { i: 7, j: 8, k: 9 });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_e = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _e.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_e)),
                fragmentName: 'fragmentFoo',
            }), { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } });
            assert.deepEqual(proxy.readFragment({
                id: 'bar',
                fragment: (_f = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _f.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_f)),
                fragmentName: 'fragmentBar',
            }), { i: 7, j: 8, k: 9 });
            var _a, _b, _c, _d, _e, _f;
        });
        it('will read some data from the store with variables', function () {
            var proxy = createCache({
                initialState: {
                    apollo: {
                        data: {
                            foo: {
                                __typename: 'Foo',
                                'field({"literal":true,"value":42})': 1,
                                'field({"literal":false,"value":42})': 2,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment foo on Foo {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], _a.raw = ["\n            fragment foo on Foo {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            }), { a: 1, b: 2 });
            var _a;
        });
        it('will return null when an id that can’t be found is provided', function () {
            var client1 = createCache();
            var client2 = createCache({
                initialState: {
                    apollo: {
                        data: {
                            bar: { __typename: 'Bar', a: 1, b: 2, c: 3 },
                        },
                    },
                },
            });
            var client3 = createCache({
                initialState: {
                    apollo: {
                        data: {
                            foo: { __typename: 'Foo', a: 1, b: 2, c: 3 },
                        },
                    },
                },
            });
            assert.equal(client1.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
            }), null);
            assert.equal(client2.readFragment({
                id: 'foo',
                fragment: (_b = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], _b.raw = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_b)),
            }), null);
            assert.deepEqual(client3.readFragment({
                id: 'foo',
                fragment: (_c = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], _c.raw = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_c)),
            }), { a: 1, b: 2, c: 3 });
            var _a, _b, _c;
        });
        it('will read data using custom resolvers', function () {
            var proxy = createCache({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                __typename: 'Query',
                            },
                            foo: {
                                __typename: 'Query',
                                id: 'foo',
                            },
                            bar: {
                                __typename: 'Thing',
                                id: 'foo',
                                a: 1,
                                b: '2',
                                c: null,
                            },
                        },
                    },
                },
                config: {
                    dataIdFromObject: function (object) { return object.id; },
                    customResolvers: {
                        Query: {
                            thing: function (_, args) { return toIdValue(args.id); },
                        },
                    },
                },
            });
            var queryResult = proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n          fragment fooFragment on Query {\n            thing(id: \"bar\") {\n              a\n              b\n              c\n            }\n          }\n        "], _a.raw = ["\n          fragment fooFragment on Query {\n            thing(id: \"bar\") {\n              a\n              b\n              c\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(queryResult, {
                thing: { a: 1, b: '2', c: null },
            });
            var _a;
        });
    });
    describe('writeQuery', function () {
        it('will write some data to the store', function () {
            var proxy = createCache();
            proxy.writeQuery({
                data: { a: 1 },
                query: (_a = ["\n          {\n            a\n          }\n        "], _a.raw = ["\n          {\n            a\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(proxy.getData(), {
                ROOT_QUERY: {
                    a: 1,
                },
            });
            proxy.writeQuery({
                data: { b: 2, c: 3 },
                query: (_b = ["\n          {\n            b\n            c\n          }\n        "], _b.raw = ["\n          {\n            b\n            c\n          }\n        "], gql(_b)),
            });
            assert.deepEqual(proxy.getData(), {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    c: 3,
                },
            });
            proxy.writeQuery({
                data: { a: 4, b: 5, c: 6 },
                query: (_c = ["\n          {\n            a\n            b\n            c\n          }\n        "], _c.raw = ["\n          {\n            a\n            b\n            c\n          }\n        "], gql(_c)),
            });
            assert.deepEqual(proxy.getData(), {
                ROOT_QUERY: {
                    a: 4,
                    b: 5,
                    c: 6,
                },
            });
            var _a, _b, _c;
        });
        it('will write some deeply nested data to the store', function () {
            var proxy = createCache();
            proxy.writeQuery({
                data: { a: 1, d: { e: 4 } },
                query: (_a = ["\n          {\n            a\n            d {\n              e\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            d {\n              e\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(proxy.getData(), {
                ROOT_QUERY: {
                    a: 1,
                    d: {
                        type: 'id',
                        id: '$ROOT_QUERY.d',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d': {
                    e: 4,
                },
            });
            proxy.writeQuery({
                data: { a: 1, d: { h: { i: 7 } } },
                query: (_b = ["\n          {\n            a\n            d {\n              h {\n                i\n              }\n            }\n          }\n        "], _b.raw = ["\n          {\n            a\n            d {\n              h {\n                i\n              }\n            }\n          }\n        "], gql(_b)),
            });
            assert.deepEqual(proxy.getData(), {
                ROOT_QUERY: {
                    a: 1,
                    d: {
                        type: 'id',
                        id: '$ROOT_QUERY.d',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d': {
                    e: 4,
                    h: {
                        type: 'id',
                        id: '$ROOT_QUERY.d.h',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d.h': {
                    i: 7,
                },
            });
            proxy.writeQuery({
                data: {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } },
                },
                query: (_c = ["\n          {\n            a\n            b\n            c\n            d {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          }\n        "], _c.raw = ["\n          {\n            a\n            b\n            c\n            d {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          }\n        "], gql(_c)),
            });
            assert.deepEqual(proxy.getData(), {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: {
                        type: 'id',
                        id: '$ROOT_QUERY.d',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d': {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: '$ROOT_QUERY.d.h',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d.h': {
                    i: 7,
                    j: 8,
                    k: 9,
                },
            });
            var _a, _b, _c;
        });
        it('will write some data to the store with variables', function () {
            var proxy = createCache();
            proxy.writeQuery({
                data: {
                    a: 1,
                    b: 2,
                },
                query: (_a = ["\n          query($literal: Boolean, $value: Int) {\n            a: field(literal: true, value: 42)\n            b: field(literal: $literal, value: $value)\n          }\n        "], _a.raw = ["\n          query($literal: Boolean, $value: Int) {\n            a: field(literal: true, value: 42)\n            b: field(literal: $literal, value: $value)\n          }\n        "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            });
            assert.deepEqual(proxy.getData(), {
                ROOT_QUERY: {
                    'field({"literal":true,"value":42})': 1,
                    'field({"literal":false,"value":42})': 2,
                },
            });
            var _a;
        });
    });
    describe('writeFragment', function () {
        it('will throw an error when there is no fragment', function () {
            var proxy = createCache();
            assert.throws(function () {
                proxy.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            query {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            query {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            assert.throws(function () {
                proxy.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            schema {\n              query: Query\n            }\n          "], _a.raw = ["\n            schema {\n              query: Query\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will throw an error when there is more than one fragment but no fragment name', function () {
            var proxy = createCache();
            assert.throws(function () {
                proxy.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
            assert.throws(function () {
                proxy.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will write some deeply nested data into the store at any id', function () {
            var proxy = createCache({
                config: { dataIdFromObject: function (o) { return o.id; } },
            });
            proxy.writeFragment({
                data: { __typename: 'Foo', e: 4, h: { id: 'bar', i: 7 } },
                id: 'foo',
                fragment: (_a = ["\n          fragment fragmentFoo on Foo {\n            e\n            h {\n              i\n            }\n          }\n        "], _a.raw = ["\n          fragment fragmentFoo on Foo {\n            e\n            h {\n              i\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(proxy.getData(), {
                foo: {
                    e: 4,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 7,
                },
            });
            proxy.writeFragment({
                data: { __typename: 'Foo', f: 5, g: 6, h: { id: 'bar', j: 8, k: 9 } },
                id: 'foo',
                fragment: (_b = ["\n          fragment fragmentFoo on Foo {\n            f\n            g\n            h {\n              j\n              k\n            }\n          }\n        "], _b.raw = ["\n          fragment fragmentFoo on Foo {\n            f\n            g\n            h {\n              j\n              k\n            }\n          }\n        "], gql(_b)),
            });
            assert.deepEqual(proxy.getData(), {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 7,
                    j: 8,
                    k: 9,
                },
            });
            proxy.writeFragment({
                data: { i: 10, __typename: 'Bar' },
                id: 'bar',
                fragment: (_c = ["\n          fragment fragmentBar on Bar {\n            i\n          }\n        "], _c.raw = ["\n          fragment fragmentBar on Bar {\n            i\n          }\n        "], gql(_c)),
            });
            assert.deepEqual(proxy.getData(), {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 10,
                    j: 8,
                    k: 9,
                },
            });
            proxy.writeFragment({
                data: { j: 11, k: 12, __typename: 'Bar' },
                id: 'bar',
                fragment: (_d = ["\n          fragment fragmentBar on Bar {\n            j\n            k\n          }\n        "], _d.raw = ["\n          fragment fragmentBar on Bar {\n            j\n            k\n          }\n        "], gql(_d)),
            });
            assert.deepEqual(proxy.getData(), {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 10,
                    j: 11,
                    k: 12,
                },
            });
            proxy.writeFragment({
                data: {
                    __typename: 'Foo',
                    e: 4,
                    f: 5,
                    g: 6,
                    h: { __typename: 'Bar', id: 'bar', i: 7, j: 8, k: 9 },
                },
                id: 'foo',
                fragment: (_e = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], _e.raw = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], gql(_e)),
                fragmentName: 'fooFragment',
            });
            assert.deepEqual(proxy.getData(), {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 7,
                    j: 8,
                    k: 9,
                },
            });
            proxy.writeFragment({
                data: { __typename: 'Bar', i: 10, j: 11, k: 12 },
                id: 'bar',
                fragment: (_f = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], _f.raw = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], gql(_f)),
                fragmentName: 'barFragment',
            });
            assert.deepEqual(proxy.getData(), {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 10,
                    j: 11,
                    k: 12,
                },
            });
            var _a, _b, _c, _d, _e, _f;
        });
        it('will write some data to the store with variables', function () {
            var proxy = createCache();
            proxy.writeFragment({
                data: {
                    a: 1,
                    b: 2,
                },
                id: 'foo',
                fragment: (_a = ["\n          fragment foo on Foo {\n            a: field(literal: true, value: 42)\n            b: field(literal: $literal, value: $value)\n          }\n        "], _a.raw = ["\n          fragment foo on Foo {\n            a: field(literal: true, value: 42)\n            b: field(literal: $literal, value: $value)\n          }\n        "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            });
            assert.deepEqual(proxy.getData(), {
                foo: {
                    'field({"literal":true,"value":42})': 1,
                    'field({"literal":false,"value":42})': 2,
                },
            });
            var _a;
        });
    });
});
//# sourceMappingURL=cache.js.map