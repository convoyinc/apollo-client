/// <reference types="mocha" />
declare const _default: (done: MochaDone, cb: (...args: any[]) => any) => (...args: any[]) => any;
export default _default;
export declare function withWarning(func: Function, regex: RegExp): Promise<void>;
export declare function withError(func: Function, regex: RegExp): any;
