"use strict";
var chai = require("chai");
var assert = chai.assert;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (done, cb) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    try {
        return cb.apply(void 0, args);
    }
    catch (e) {
        done(e);
    }
}; };
function withWarning(func, regex) {
    var message;
    var oldWarn = console.warn;
    console.warn = function (m) { return message = m; };
    try {
        var result = func();
        assert.match(message, regex);
        return result;
    }
    finally {
        console.warn = oldWarn;
    }
}
exports.withWarning = withWarning;
//# sourceMappingURL=wrap.js.map