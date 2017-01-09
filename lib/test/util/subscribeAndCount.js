import wrap from './wrap';
export default function (done, observable, cb) {
    var handleCount = 0;
    return observable.subscribe({
        next: wrap(done, function (result) {
            handleCount++;
            cb(handleCount, result);
        }),
        error: done,
    });
}
;
//# sourceMappingURL=subscribeAndCount.js.map