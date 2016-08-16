"use strict";
var every = require('lodash.every');
var has = require('lodash.has');
function cachedFetchById(field, variables, store, next) {
    if (field.arguments && field.arguments.length === 1) {
        var onlyArg = field.arguments[0];
        if (onlyArg.value.kind === 'Variable') {
            var variable = onlyArg.value;
            if (onlyArg.name.value === 'id') {
                var id = variables[variable.name.value];
                if (has(store, id)) {
                    return toIdValue(id);
                }
            }
            else if (onlyArg.name.value === 'ids') {
                var ids = variables[variable.name.value];
                if (every(ids, function (id) { return has(store, id); })) {
                    return ids;
                }
            }
        }
    }
    return next();
}
exports.cachedFetchById = cachedFetchById;
function toIdValue(id) {
    return {
        type: 'id',
        id: id,
        generated: false,
    };
}
//# sourceMappingURL=fetchMiddleware.js.map