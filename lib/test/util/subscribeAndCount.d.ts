/// <reference types="mocha" />
import { ObservableQuery } from '../../src/core/ObservableQuery';
import { ApolloQueryResult } from '../../src/core/QueryManager';
import { Subscription } from '../../src/util/Observable';
export default function (done: MochaDone, observable: ObservableQuery, cb: (handleCount: number, result: ApolloQueryResult) => any): Subscription;
