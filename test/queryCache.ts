import {assert} from 'chai';
import mockNetworkInterface from './mocks/mockNetworkInterface';
import gql from 'graphql-tag';
import ApolloClient from '../src/ApolloClient';
import {cloneDeep} from '../src/util/cloneDeep';
import {NetworkInterface} from '../src/transport/networkInterface';

describe('query cache', () => {
  const query = gql`
    query account {
      node(id: "account1") {
        id
        name
        owner {
          id
          name
        }
        users {
          id
          name
        }
      }
    }
  `;

  const data = {
    data: {
      node: {
        id: 'account1',
        name: 'Account 1',
        owner: {
          id: 'user1',
          name: 'User 1',
        },
        users: [
          {
            id: 'user1',
            name: 'User 1',
          },
          {
            id: 'user2',
            name: 'User 2',
          },
        ],
      },
    },
  };

  const initialState: any = {
    apollo: {
      data: {
        'ROOT_QUERY': {
          'node({"id":"account1"})': {
            'generated': false,
            'id': 'account1',
            'type': 'id',
          },
        },
        'account1': {
          'id': 'account1',
          'name': 'Account 1',
          'owner': {
            'generated': false,
            'id': 'user1',
            'type': 'id',
          },
          'users': [
            {
              'generated': false,
              'id': 'user1',
              'type': 'id',
            },
            {
              'generated': false,
              'id': 'user2',
              'type': 'id',
            },
          ],
        },
        'user1': {
          'id': 'user1',
          'name': 'User 1',
        },
        'user2': {
          'id': 'user2',
          'name': 'User 2',
        },
      },
    },
  };

  it('is inserted when provided initial state with data for query', () => {
    const networkInterface = mockNetworkInterface();

    const client = new ApolloClient({
      networkInterface,
      initialState,
      addTypename: false,
      dataIdFromObject: (obj: any) => obj.id,
    });

    return client.query({query, fetchPolicy: 'cache-only'})
      .then((result: any) => {
        assert.deepEqual(result.data, data.data);

        assert.deepEqual(client.store.getState().apollo.cache, {
          data: initialState.apollo.data,
          queryCache: {
            '1': {
              state: 'fresh',
              result: data.data,
              variables: {},
              keys: {
                'ROOT_QUERY.node({"id":"account1"})': true,
                'account1': true,
                'user1': true,
                'user2': true,
              },
            },
          },
        });
      });
  });

  it('is inserted after requesting a query over the network', () => {
    const networkInterface = mockNetworkInterface({
      request: { query },
      result: data,
    });

    const client = new ApolloClient({
      networkInterface,
      addTypename: false,
      dataIdFromObject: (obj: any) => obj.id,
    });

    return client.query({ query })
      .then((result: any) => {
        assert.deepEqual(result.data, data.data);

        assert.deepEqual(client.store.getState().apollo.cache, {
          data: initialState.apollo.data,
          queryCache: {
            '1': {
              state: 'fresh',
              result: data.data,
              variables: {},
              keys: {
                'ROOT_QUERY.node({"id":"account1"})': true,
                'account1': true,
                'user1': true,
                'user2': true,
              },
            },
          },
        });
      });
  });

  describe('with mutation and update queries', () => {
    const mutation = gql`
        mutation dummyMutation {
            id
        }
    `;

    const mutationResult = {
      data: {
        id: 'dummy',
      },
    };

    const setupClient = (networkInterface? : NetworkInterface): ApolloClient => {
      networkInterface = networkInterface || mockNetworkInterface({
        request: { query },
        result: data,
      }, {
        request: { query: mutation },
        result: mutationResult,
      }, {
        request: { query },
        result: data,
      });

      return new ApolloClient({
        networkInterface,
        addTypename: false,
        dataIdFromObject: (obj: any) => obj.id,
      });
    };

    it('is fresh with updateStoreFlag true', done => {
      const expectedData = cloneDeep(initialState.apollo.data);
      expectedData['ROOT_MUTATION'] = {id: 'dummy'};
      expectedData['account1'].name = 'Account 1 (updated)';

      const expectedResult = cloneDeep(data.data);
      expectedResult.node.name = 'Account 1 (updated)';

      let expectedCache = {
        data: expectedData,
        queryCache: {
          '1': {
            state: 'fresh',
            result: expectedResult,
            variables: {},
            keys: {
              'ROOT_QUERY.node({"id":"account1"})': true,
              'account1': true,
              'user1': true,
              'user2': true,
            },
          },
        },
      };

      const client = setupClient();

      let c = 0;
      client.watchQuery({ query }).subscribe({
        next: (result: any) => {
          switch (c++) {
            case 0:
              assert.deepEqual(result.data, data.data);

              client.mutate({
                mutation,
                updateQueries: {
                  account: (prev: any) => {
                    const newData = cloneDeep(prev);
                    newData.node.name = 'Account 1 (updated)';
                    return newData;
                  },
                },
              }).then(() => {
                assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
              });
              break;
            case 1:
              assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
              done();
              break;
            default:
              done(new Error('`next` was called to many times.'));
          }
        },
      });
    });

    it('is dirty with updateStoreFlag false and refetched after waking from standby', done => {
      const expectedData = cloneDeep(initialState.apollo.data);
      expectedData['ROOT_MUTATION'] = {id: 'dummy'};

      const expectedResult = cloneDeep(data.data);
      expectedResult.node.name = 'Account 1 (updated)';

      let expectedCache = {
        data: expectedData,
        queryCache: {
          '1': {
            state: 'dirty',
            result: expectedResult,
            variables: {},
            keys: {
              'ROOT_QUERY.node({"id":"account1"})': true,
              'account1': true,
              'user1': true,
              'user2': true,
            },
          },
        },
      };

      const client = setupClient();

      let c = 0;
      const observable = client.watchQuery({ query });
      observable.subscribe({
        next: (result: any) => {
          switch (c++) {
            case 0:
              assert.deepEqual(result.data, data.data);

              client.mutate({
                mutation,
                updateQueries: {
                  account: (prev: any, options: any) => {
                    const newData = cloneDeep(prev);
                    newData.node.name = 'Account 1 (updated)';

                    options.updateStoreFlag = false;

                    return newData;
                  },
                },
              }).then(() => {
                assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
              });
              break;
            case 1:
              assert.deepEqual(client.store.getState().apollo.cache, expectedCache);

              observable.setOptions({
                fetchPolicy: 'standby',
              });

              observable.setOptions({
                fetchPolicy: 'cache-first',
              });
              break;
            case 2:
              expectedCache = cloneDeep(expectedCache);
              expectedCache.queryCache['1'].state = 'fresh';
              expectedCache.queryCache['1'].result.node.name = data.data.node.name;
              assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
              done();
              break;
            default:
              done(new Error('`next` was called to many times.'));
          }
        },
      });
    });

    it('works with regexp and forceQueryCacheState', () => {
      const randomQuery = gql`
        query random {
          random {
            id
            name
          }
        }
      `;

      const randomQueryData = {
        data: {
          random: {
            id: 'random',
            name: 'Random',
          },
        },
      };

      const randomQuery2 = gql`
        query random2 {
          random2 {
            id
            name
          }
        }
      `;

      const randomQueryData2 = {
        data: {
          random2: {
            id: 'random2',
            name: 'Random 2',
          }
        },
      };

      const expectedData = {
        ...initialState.apollo.data,
        'ROOT_QUERY': {
          ...initialState.apollo.data.ROOT_QUERY,
          'random': {
            'generated': false,
            'id': 'random',
            'type': 'id',
          },
          'random2': {
            'generated': false,
            'id': 'random2',
            'type': 'id',
          },
        },
        'ROOT_MUTATION': { id: 'dummy' },
        'account1': {
            ...initialState.apollo.data.account1,
          'name': 'Account 1 (updated)',
        },
        'random': {
          'id': 'random',
          'name': 'Random',
        },
        'random2': {
          'id': 'random2',
          'name': 'Random 2',
        },
      };

      let expectedCache = {
        data: expectedData,
        queryCache: {
          '1': {
            state: 'fresh',
            result: {
              node: {
                ...data.data.node,
                name: 'Account 1 (updated)',
              },
            },
            variables: {},
            keys: {
              'ROOT_QUERY.node({"id":"account1"})': true,
              'account1': true,
              'user1': true,
              'user2': true,
            },
          },
          '3': {
            state: 'dirty',
            result: randomQueryData.data,
            variables: {},
            keys: {
              'ROOT_QUERY.random': true,
              'random': true,
            },
          },
          '5': {
            state: 'dirty',
            result: randomQueryData2.data,
            variables: {},
            keys: {
              'ROOT_QUERY.random2': true,
              'random2': true,
            },
          },
        },
      };

      const client = setupClient(mockNetworkInterface({
        request: { query },
        result: data,
      }, {
        request: { query: randomQuery },
        result: randomQueryData,
      }, {
        request: { query: randomQuery2 },
        result: randomQueryData2,
      }, {
        request: { query: mutation },
        result: mutationResult,
      }));

      return Promise.all([
        new Promise((resolve, reject) => {
          const handle = client.watchQuery({ query: query });
          handle.subscribe({
            next(res) {
              resolve(res);
            },
          });
        }),
        new Promise((resolve, reject) => {
          const handle = client.watchQuery({ query: randomQuery });
          handle.subscribe({
            next(res) {
              resolve(res);
            },
          });
        }),
        new Promise((resolve, reject) => {
          const handle = client.watchQuery({ query: randomQuery2 });
          handle.subscribe({
            next(res) {
              resolve(res);
            },
          });
        }),
      ])
      .then(() => {
        return client.mutate({
          mutation,
          updateQueries: {
            account: (prev: any, options: any) => {
              const newData = cloneDeep(prev);
              newData.node.name = 'Account 1 (updated)';
              return newData;
            },
            '/random/': (prev: any, options: any) => {
              options.forceQueryCacheState = 'dirty';
              return prev;
            },
          },
        })
      })
      .then(() => {
        assert.deepEqual(client.store.getState().apollo.cache, expectedCache);
      });
    });
  });
});
