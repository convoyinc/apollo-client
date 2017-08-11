import { QueryManager } from '../../src/core/QueryManager';
import mockNetworkInterface from './mockNetworkInterface';
export default function () {
    var mockedResponses = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mockedResponses[_i] = arguments[_i];
    }
    return new QueryManager({
        networkInterface: mockNetworkInterface.apply(void 0, mockedResponses),
        addTypename: false,
    });
};
//# sourceMappingURL=mockQueryManager.js.map