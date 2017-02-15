export default function (done, observable, cb) {
    var handleCount = 0;
    var subscription = observable.subscribe({
        next: function (result) {
            try {
                handleCount++;
                cb(handleCount, result);
            }
            catch (e) {
                subscription.unsubscribe();
                done(e);
            }
        },
        error: done,
    });
    return subscription;
}
;
//# sourceMappingURL=subscribeAndCount.js.map