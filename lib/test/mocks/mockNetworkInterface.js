"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var printer_1 = require('graphql-tag/printer');
function mockNetworkInterface() {
    var mockedResponses = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mockedResponses[_i - 0] = arguments[_i];
    }
    return new (MockNetworkInterface.bind.apply(MockNetworkInterface, [void 0].concat(mockedResponses)))();
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mockNetworkInterface;
function mockBatchedNetworkInterface() {
    var mockedResponses = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mockedResponses[_i - 0] = arguments[_i];
    }
    return new (MockBatchedNetworkInterface.bind.apply(MockBatchedNetworkInterface, [void 0].concat(mockedResponses)))();
}
exports.mockBatchedNetworkInterface = mockBatchedNetworkInterface;
var MockNetworkInterface = (function () {
    function MockNetworkInterface() {
        var _this = this;
        var mockedResponses = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            mockedResponses[_i - 0] = arguments[_i];
        }
        this.mockedResponsesByKey = {};
        mockedResponses.forEach(function (mockedResponse) {
            _this.addMockedReponse(mockedResponse);
        });
    }
    MockNetworkInterface.prototype.addMockedReponse = function (mockedResponse) {
        var key = requestToKey(mockedResponse.request);
        var mockedResponses = this.mockedResponsesByKey[key];
        if (!mockedResponses) {
            mockedResponses = [];
            this.mockedResponsesByKey[key] = mockedResponses;
        }
        mockedResponses.push(mockedResponse);
    };
    MockNetworkInterface.prototype.query = function (request) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var parsedRequest = {
                query: request.query,
                variables: request.variables,
                debugName: request.debugName,
            };
            var key = requestToKey(parsedRequest);
            var responses = _this.mockedResponsesByKey[key];
            if (!responses || responses.length === 0) {
                throw new Error("No more mocked responses for the query: " + printer_1.print(request.query) + ", variables: " + JSON.stringify(request.variables));
            }
            var _a = responses.shift(), result = _a.result, error = _a.error, delay = _a.delay;
            if (!result && !error) {
                throw new Error("Mocked response should contain either result or error: " + key);
            }
            setTimeout(function () {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            }, delay ? delay : 0);
        });
    };
    return MockNetworkInterface;
}());
exports.MockNetworkInterface = MockNetworkInterface;
var MockBatchedNetworkInterface = (function (_super) {
    __extends(MockBatchedNetworkInterface, _super);
    function MockBatchedNetworkInterface() {
        _super.apply(this, arguments);
    }
    MockBatchedNetworkInterface.prototype.batchQuery = function (requests) {
        var _this = this;
        var resultPromises = [];
        requests.forEach(function (request) {
            resultPromises.push(_this.query(request));
        });
        return Promise.all(resultPromises);
    };
    return MockBatchedNetworkInterface;
}(MockNetworkInterface));
exports.MockBatchedNetworkInterface = MockBatchedNetworkInterface;
function requestToKey(request) {
    var queryString = request.query && printer_1.print(request.query);
    return JSON.stringify({
        variables: request.variables,
        debugName: request.debugName,
        query: queryString,
    });
}
//# sourceMappingURL=mockNetworkInterface.js.map