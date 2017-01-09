"use strict";
var QueryManager_1 = require("../../src/core/QueryManager");
var mockNetworkInterface_1 = require("./mockNetworkInterface");
var store_1 = require("../../src/store");
var defaultReduxRootSelector = function (state) { return state.apollo; };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    var mockedResponses = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mockedResponses[_i] = arguments[_i];
    }
    return new QueryManager_1.QueryManager({
        networkInterface: mockNetworkInterface_1.default.apply(void 0, mockedResponses),
        store: store_1.createApolloStore(),
        reduxRootSelector: defaultReduxRootSelector,
        addTypename: false,
    });
};
//# sourceMappingURL=mockQueryManager.js.map