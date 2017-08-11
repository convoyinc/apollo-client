import { addTypenameToDocument } from '../queries/queryTransform';
import { getFragmentQueryDocument, } from '../queries/getFromAST';
var Cache = (function () {
    function Cache(addTypename) {
        this.addTypename = addTypename;
    }
    Cache.prototype.readQuery = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        var query = options.query;
        if (this.addTypename) {
            query = addTypenameToDocument(query);
        }
        return this.read({
            query: query,
            variables: options.variables,
            optimistic: optimistic,
        });
    };
    Cache.prototype.readFragment = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        var document = getFragmentQueryDocument(options.fragment, options.fragmentName);
        if (this.addTypename) {
            document = addTypenameToDocument(document);
        }
        return this.read({
            query: document,
            variables: options.variables,
            rootId: options.id,
            optimistic: optimistic,
        });
    };
    Cache.prototype.writeQuery = function (options) {
        var query = options.query;
        if (this.addTypename) {
            query = addTypenameToDocument(query);
        }
        this.writeResult({
            dataId: 'ROOT_QUERY',
            result: options.data,
            document: query,
            variables: options.variables,
        });
    };
    Cache.prototype.writeFragment = function (options) {
        var document = getFragmentQueryDocument(options.fragment, options.fragmentName);
        if (this.addTypename) {
            document = addTypenameToDocument(document);
        }
        this.writeResult({
            dataId: options.id,
            result: options.data,
            document: document,
            variables: options.variables,
        });
    };
    return Cache;
}());
export { Cache };
//# sourceMappingURL=cache.js.map