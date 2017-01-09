import { ObservableQuery } from '../../src/core/ObservableQuery';
import { ApolloQueryResult } from '../../src/core/QueryManager';
import { Subscription } from '../../src/util/Observable';
export declare type Options = {
    observable: ObservableQuery;
    shouldResolve?: boolean;
    wait?: number;
    errorCallbacks?: ((error: Error) => any)[];
};
export declare type ResultCallback = ((result: ApolloQueryResult) => any);
export declare function observableToPromiseAndSubscription({observable, shouldResolve, wait, errorCallbacks}: Options, ...cbs: ResultCallback[]): {
    promise: Promise<any[]>;
    subscription: Subscription;
};
export default function (options: Options, ...cbs: ResultCallback[]): Promise<any[]>;
