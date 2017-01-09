function deepFreeze(o) {
    Object.freeze(o);
    Object.getOwnPropertyNames(o).forEach(function (prop) {
        if (o.hasOwnProperty(prop)
            && o[prop] !== null
            && (typeof o[prop] === 'object' || typeof o[prop] === 'function')
            && !Object.isFrozen(o[prop])) {
            deepFreeze(o[prop]);
        }
    });
    return o;
}
;
export default function maybeDeepFreeze(obj) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        return deepFreeze(obj);
    }
    return obj;
}
//# sourceMappingURL=maybeDeepFreeze.js.map