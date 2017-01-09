"use strict";
require("es6-promise");
require("isomorphic-fetch");
process.env.NODE_ENV = 'test';
require('source-map-support').install();
console.warn = console.error = function () {
    var messages = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        messages[_i] = arguments[_i];
    }
    console.log.apply(console, ["==> Error in test: Tried to log warning or error with message:\n"].concat(messages));
    if (!process.env.CI && !messages[0].match(/deprecated/)) {
        process.exit(1);
    }
};
process.on('unhandledRejection', function () { });
require("./writeToStore");
require("./readFromStore");
require("./roundtrip");
require("./diffAgainstStore");
require("./networkInterface");
require("./deduplicator");
require("./QueryManager");
require("./client");
require("./store");
require("./queryTransform");
require("./getFromAST");
require("./directives");
require("./batching");
require("./scheduler");
require("./mutationResults");
require("./optimistic");
require("./fetchMore");
require("./scopeQuery");
require("./errors");
require("./mockNetworkInterface");
require("./graphqlSubscriptions");
require("./batchedNetworkInterface");
require("./ObservableQuery");
require("./subscribeToMore");
require("./customResolvers");
//# sourceMappingURL=tests.js.map