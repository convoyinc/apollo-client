"use strict";
var wrap_1 = require("./wrap");
function default_1(done, observable, cb) {
    var handleCount = 0;
    return observable.subscribe({
        next: wrap_1.default(done, function (result) {
            handleCount++;
            cb(handleCount, result);
        }),
        error: done,
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;
//# sourceMappingURL=subscribeAndCount.js.map