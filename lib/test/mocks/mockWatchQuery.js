"use strict";
var mockQueryManager_1 = require("./mockQueryManager");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    var mockedResponses = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mockedResponses[_i] = arguments[_i];
    }
    var queryManager = mockQueryManager_1.default.apply(void 0, mockedResponses);
    var firstRequest = mockedResponses[0].request;
    return queryManager.watchQuery({
        query: firstRequest.query,
        variables: firstRequest.variables,
    });
};
//# sourceMappingURL=mockWatchQuery.js.map